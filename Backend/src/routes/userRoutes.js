import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/userController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { userIdParamSchema } from "../validations/userValidation.js";

const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, userController.getUsers); // Get all users (Admin only)
router.get("/:id", protect, validateRequest(userIdParamSchema), userController.getUserById); // Get user by ID

export default router;
