import e from "express";
import * as reportService from "../services/reportService.js";

const exportTasksReport = async (req, res) => {
    try {
        const reportTasksBuffer = await reportService.generateTasksReport();
        return res.status(200).send(reportTasksBuffer);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    };
};

const exportUsersReport = async (req, res) => {
    try {
        const reportUsersBuffer = await reportService.generateUsersReport();
        return res.status(200).send(reportUsersBuffer);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    };
};

export { exportTasksReport, exportUsersReport };