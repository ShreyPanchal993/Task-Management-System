import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadMiddleware.js";
import { issueCsrfToken, requireCsrfProtection } from "../utils/csrf.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authLimiter, refreshLimiter, uploadLimiter } from "../middlewares/rateLimiters.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validations/authValidation.js";
import logger from "../config/logger.js";
import { buildPublicUploadUrl } from "../utils/publicUrl.js";

const router = express.Router();

// Auth Routes
router.get("/csrf-token", issueCsrfToken);

router.post("/register", authLimiter, requireCsrfProtection, validateRequest(registerSchema), authController.registerUser);

router.post("/login", authLimiter, requireCsrfProtection, validateRequest(loginSchema), authController.loginUser);

router.post("/logout", requireCsrfProtection, authController.logoutUser);

router.post("/refresh-token", refreshLimiter, requireCsrfProtection, authController.refreshToken);

router
    .route("/profile")
    .get(protect, authController.getUserProfile)
    .patch(protect, requireCsrfProtection, validateRequest(updateProfileSchema), authController.updateUserProfile);

router.post("/upload-image", uploadLimiter, protect, requireCsrfProtection, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            logger.warn("Upload image rejected: no file provided", {
                method: req.method,
                url: req.originalUrl,
                userId: req.user?._id?.toString?.() || req.user?.id || null,
                ip: req.ip,
            });
            return res.status(400).json({ message: "No image uploaded" });
        }

        const imageUrl = buildPublicUploadUrl(req, req.file.filename);

        res.status(200).json({ message: "Image uploaded successfully", url: imageUrl });
    } catch (error) {
        logger.error("Upload image failed", {
            method: req.method,
            url: req.originalUrl,
            userId: req.user?._id?.toString?.() || req.user?.id || null,
            error: error.message,
            stack: error.stack,
            ip: req.ip,
        });
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

export default router;
