import Task from "../models/Task.js";
import User from "../models/User.js";
import excelJS from "exceljs";

const getAllTasks = async () => {
    const tasks = await Task.find()
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .lean();

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    worksheet.columns = [
        { header: "Task ID", key: "taskId", width: 25 },
        { header: "Title", key: "title", width: 30 },
        { header: "Description", key: "description", width: 50 },
        { header: "Priority", key: "priority", width: 15 },
        { header: "Status", key: "status", width: 20 },
        { header: "Due Date", key: "dueDate", width: 20 },
        { header: "Assigned To", key: "assignedTo", width: 30 },
    ];

    tasks.forEach((task) => {
        const assignedTo = task.assignedTo
            .map((user) => `${user.name} (${user.email})`)
            .join(", ");
        worksheet.addRow({
            taskId: task._id.toString(),
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate.toISOString().split("T")[0],
            assignedTo: assignedTo || "Unassigned",
        });
    });

    return await workbook.xlsx.writeBuffer();
};

const getAllUsers = async () => {
    const [users, taskCounts] = await Promise.all([
        User.find().select("name email _id").lean(),
        Task.aggregate([
            { $unwind: "$assignedTo" },
            {
                $group: {
                    _id: "$assignedTo",
                    taskCount: { $sum: 1 },
                    pendingTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
                        },
                    },
                    inProgressTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0],
                        },
                    },
                    completedTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
                        },
                    },
                },
            },
        ]),
    ]);

    const taskCountMap = new Map(
        taskCounts.map((item) => [item._id.toString(), item])
    );

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Tasks Report");

    worksheet.columns = [
        { header: "User Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 40 },
        { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
        { header: "Pending Tasks", key: "pendingTasks", width: 20 },
        { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
        { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];

    users.forEach((user) => {
        const counts = taskCountMap.get(user._id.toString());
        worksheet.addRow({
            name: user.name,
            email: user.email,
            taskCount: counts?.taskCount || 0,
            pendingTasks: counts?.pendingTasks || 0,
            inProgressTasks: counts?.inProgressTasks || 0,
            completedTasks: counts?.completedTasks || 0,
        });
    });

    return await workbook.xlsx.writeBuffer();
};

export { getAllTasks, getAllUsers };
