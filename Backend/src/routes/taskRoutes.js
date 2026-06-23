import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import * as taskController from '../controllers/taskController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createTaskSchema, getTasksQuerySchema, taskIdParamSchema, updateTaskChecklistSchema, updateTaskSchema, updateTaskStatusSchema } from '../validations/taskValidation.js';

const router = express.Router();

router.get("/dashboard-data", protect, taskController.getDashboardData); 
router.get("/user-dashboard-data", protect, taskController.getUserDashboardData);
router.get("/", protect, validateRequest(getTasksQuerySchema), taskController.getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", protect, validateRequest(taskIdParamSchema), taskController.getTaskById); // Get task by ID
router.post("/", protect, adminOnly, validateRequest(createTaskSchema), taskController.createTask); // Create a new task (Admin Only)
router.put("/:id", protect, adminOnly, validateRequest({ ...taskIdParamSchema, ...updateTaskSchema }), taskController.updateTask); // Update task details (Admin Only)
router.delete("/:id", protect, adminOnly, validateRequest(taskIdParamSchema), taskController.deleteTask); // Delete task by ID (Admin Only)
router.put("/:id/status", protect, validateRequest({ ...taskIdParamSchema, ...updateTaskStatusSchema }), taskController.updateTaskStatus); // Update task status
router.put("/:id/todo", protect, validateRequest({ ...taskIdParamSchema, ...updateTaskChecklistSchema }), taskController.updateTaskChecklist); // Update task checklist

export default router;
