import express from "express";
import { protect, adminOnly, superAdminOnly } from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/userController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { userIdParamSchema, updateUserRoleSchema } from "../validations/userValidation.js";

const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, userController.getUsers); // Get all users (Admin only)
router.get("/:id", protect, validateRequest(userIdParamSchema), userController.getUserById); // Get user by ID
router.patch("/:id/role", protect, superAdminOnly, validateRequest(updateUserRoleSchema), userController.updateUserRole);

export default router;
