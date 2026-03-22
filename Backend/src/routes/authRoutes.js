import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadMiddleware.js";
import { issueCsrfToken, requireCsrfProtection } from "../utils/csrf.js";

const router = express.Router();

// Auth Routes
router.get("/csrf-token", issueCsrfToken);

router.post("/register", requireCsrfProtection, authController.registerUser);

router.post("/login", requireCsrfProtection, authController.loginUser);

router.post("/logout", requireCsrfProtection, authController.logoutUser);

router.post("/refresh-token", requireCsrfProtection, authController.refreshToken);

router
    .route("/profile")
    .get(protect, authController.getUserProfile)
    .patch(protect, requireCsrfProtection, authController.updateUserProfile);

router.post("/upload-image", protect, requireCsrfProtection, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        res.status(200).json({ message: "Image uploaded successfully", url: imageUrl });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

export default router;
