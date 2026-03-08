import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Auth Routes
router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post("/logout", protect, authController.logoutUser);

router.post("/refresh-token", authController.refreshToken);

router
    .route("/profile")
    .get(protect, authController.getUserProfile)
    .patch(protect, authController.updateUserProfile);

router.post("/upload-image", upload.single("image"), (req, res) => {
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