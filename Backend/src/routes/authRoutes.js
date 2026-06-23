import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadMiddleware.js";
import { issueCsrfToken, requireCsrfProtection } from "../utils/csrf.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authLimiter, refreshLimiter, uploadLimiter } from "../middlewares/rateLimiters.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validations/authValidation.js";
import { uploadImageToSupabase } from "../utils/supabaseStorage.js";

const router = express.Router();
const uploadSingleImage = upload.single("image");

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

router.post("/upload-image", uploadLimiter, protect, requireCsrfProtection, (req, res) => {
    uploadSingleImage(req, res, async (error) => {
        if (error) {
            const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return res.status(statusCode).json({
                success: false,
                message: error.message,
            });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        try {
            const { publicUrl } = await uploadImageToSupabase(req.file);

            return res.status(200).json({
                success: true,
                message: "Image uploaded successfully",
                url: publicUrl,
            });
        } catch (uploadError) {
            const statusCode = uploadError.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                message: uploadError.message || "Failed to upload image",
            });
        }
    });
});

export default router;
