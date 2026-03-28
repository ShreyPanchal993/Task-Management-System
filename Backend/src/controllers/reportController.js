import e from "express";
import * as reportService from "../services/reportService.js";
import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";

const getRequestContext = (req, extra = {}) => ({
    method: req.method,
    url: req.originalUrl,
    origin: req.get("origin") || null,
    userId: req.user?._id?.toString?.() || req.user?.id || null,
    ip: req.ip,
    ...extra,
});

const exportTasksReport = async (req, res) => {
    try {
        const reportTasksBuffer = await reportService.generateTasksReport();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=tasks-report.xlsx");
        logger.info("Tasks report exported", getRequestContext(req));
        return res.status(200).send(reportTasksBuffer);
    } catch (error) {
        logger.error("Export tasks report failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    };
};

const exportUsersReport = async (req, res) => {
    try {
        const reportUsersBuffer = await reportService.generateUsersReport();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=users-report.xlsx");
        logger.info("Users report exported", getRequestContext(req));
        return res.status(200).send(reportUsersBuffer);
    } catch (error) {
        logger.error("Export users report failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    };
};

export { exportTasksReport, exportUsersReport };
