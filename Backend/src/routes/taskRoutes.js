import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

router.get("/dashboard-data", protect, taskController.getDashboardData); 
router.get("/user-dashboard-data", protect, taskController.getUserDashboardData);
router.get("/", protect, taskController.getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", protect, taskController.getTaskById); // Get task by ID
router.post("/", protect, adminOnly, taskController.createTask); // Create a new task (Admin Only)
router.put("/:id", protect, taskController.updateTask); // Update task details 
router.delete("/:id", protect, adminOnly, taskController.deleteTask); // Delete task by ID (Admin Only)
router.put("/:id/status", protect, taskController.updateTaskStatus); // Update task status
router.put("/:id/todo", protect, taskController.updateTaskChecklist); // Update task checklist

export default router;