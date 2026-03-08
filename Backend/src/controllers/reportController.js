import e from "express";
import * as reportService from "../services/reportService.js";
import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";

const exportTasksReport = async (req, res) => {
    try {
        const reportTasksBuffer = await reportService.generateTasksReport();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=tasks-report.xlsx");
        logger.info(`Tasks report exported by ${req.user._id}`);
        return res.status(200).send(reportTasksBuffer);
    } catch (error) {
        logger.error(`Export tasks report failed: ${error.message}`);
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    };
};

const exportUsersReport = async (req, res) => {
    try {
        const reportUsersBuffer = await reportService.generateUsersReport();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=users-report.xlsx");
        logger.info(`Users report exported by ${req.user._id}`);
        return res.status(200).send(reportUsersBuffer);
    } catch (error) {
        logger.error(`Export users report failed: ${error.message}`);
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    };
};

export { exportTasksReport, exportUsersReport };