import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import * as reportController from "../controllers/reportController.js";

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, reportController.exportTasksReport);
router.get("/export/users", protect, adminOnly, reportController.exportUsersReport);

export default router;