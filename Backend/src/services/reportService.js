import * as reportRepository from "../repositories/reportRepository.js";

const generateTasksReport = async () => {
    // Logic to generate tasks report
    const tasks = await reportRepository.getAllTasks(); // Fetch tasks from repository
    // const reportBuffer = Buffer.from("Tasks Report Data"); // Placeholder
    return tasks;
}

const generateUsersReport = async () => {
    // Logic to generate users report
    const users = await reportRepository.getAllUsers(); // Fetch users from repository  
    // const reportBuffer = Buffer.from("Users Report Data"); // Placeholder
    return users;
}

export { generateTasksReport, generateUsersReport };