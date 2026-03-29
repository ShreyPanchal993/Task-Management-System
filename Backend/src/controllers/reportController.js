import * as reportService from "../services/reportService.js";
import ApiError from "../utils/ApiError.js";

const exportTasksReport = async (req, res) => {
    try {
        const reportTasksBuffer = await reportService.generateTasksReport();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=tasks-report.xlsx");
        return res.status(200).send(reportTasksBuffer);
    } catch (error) {
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    };
};

const exportUsersReport = async (req, res) => {
    try {
        const reportUsersBuffer = await reportService.generateUsersReport();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=users-report.xlsx");
        return res.status(200).send(reportUsersBuffer);
    } catch (error) {
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    };
};

export { exportTasksReport, exportUsersReport };
