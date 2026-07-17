import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadMiddleware.js";
import { issueCsrfToken, requireCsrfProtection } from "../utils/csrf.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authLimiter, refreshLimiter, uploadLimiter } from "../middlewares/rateLimiters.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validations/authValidation.js";

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

router.post(
    "/upload-image",
    uploadLimiter,
    protect,
    requireCsrfProtection,
    upload.single("image"),
    authController.uploadImage
);

router.get("/image/:folder/:filename", protect, (req, res, next) => {
    req.params.key = `${req.params.folder}/${req.params.filename}`;
    next();
}, authController.getImageUrl);

router.delete("/image/:folder/:filename", protect, requireCsrfProtection, (req, res, next) => {
    req.params.key = `${req.params.folder}/${req.params.filename}`;
    next();
}, authController.deleteImage);

export default router;
