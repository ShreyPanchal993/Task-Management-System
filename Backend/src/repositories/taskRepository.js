import Task from "../models/Task.js";
import { TASK_STATUS, TASK_PRIORITIES } from "../constants/constants.js";

const canManageAllTasks = (user) => user.role === "admin" || user.role === "super_admin";
const taskListPopulate = { path: "assignedTo", select: "name email profilePicture" };
const buildTaskVisibilityFilter = (user, filter = {}) =>
    canManageAllTasks(user) ? filter : { ...filter, assignedTo: user._id };
const buildTaskStatusSummary = (statusCounts = []) => {
    const countMap = statusCounts.reduce((acc, statusItem) => {
        acc[statusItem._id] = statusItem.count;
        return acc;
    }, {});

    return {
        all: Object.values(countMap).reduce((total, count) => total + count, 0),
        pendingTasks: countMap.Pending || 0,
        inProgressTasks: countMap["In Progress"] || 0,
        completedTasks: countMap.Completed || 0,
    };
};

const getTasks = async (user, filter = {}) => { 
    const baseFilter = buildTaskVisibilityFilter(user, filter);
    const summaryFilter = canManageAllTasks(user) ? {} : { assignedTo: user._id };

    const [tasksRaw, statusCounts] = await Promise.all([
        Task.find(baseFilter).populate(taskListPopulate).lean(),
        Task.aggregate([
            { $match: summaryFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
    ]);

    const tasks = tasksRaw.map(task => ({
        ...task,
        completedTodoCount: task.todoChecklist.filter(item => item.completed).length,
    }));

    return { 
        tasks, 
        statusSummary: buildTaskStatusSummary(statusCounts),
    };
};

const getTaskById = async (taskId, user) => {
    const filter = user ? buildTaskVisibilityFilter(user, { _id: taskId }) : { _id: taskId };
    return Task.findOne(filter).populate(taskListPopulate);
};

const createTask = async (taskData) => {  
    const newTask = await Task.create(taskData);
    return newTask;
};

const updateTask = async (taskData) => {
    const assignedToIds = taskData.assignedTo?.map(user => user._id || user) || taskData.assignedTo;
    const updatedTask = await Task.findByIdAndUpdate(
        taskData._id, 
        { ...taskData, assignedTo: assignedToIds }, 
        { new: true }
    ).populate(taskListPopulate);
    return updatedTask;
};

const deleteTask = async (taskId) => { 
    const deleted = await Task.findByIdAndDelete(taskId);
    return deleted;
};

const updateTaskStatus = async (task) => {
    const assignedToIds = task.assignedTo.map(user => user._id || user);
    const updatedTask = await Task.findByIdAndUpdate(
        task._id, 
        { 
            status: task.status,
            todoChecklist: task.todoChecklist,
            progress: task.progress,
            assignedTo: assignedToIds
        }, 
        { new: true }
    ).populate(taskListPopulate);
    return updatedTask;
};

const updateTaskChecklist = async (task) => { 
    const assignedToIds = task.assignedTo.map(user => user._id || user);
    const updatedTask = await Task.findByIdAndUpdate(
        task._id, 
        { 
            todoChecklist: task.todoChecklist,
            progress: task.progress,
            status: task.status,
            assignedTo: assignedToIds
        }, 
        { new: true }
    ).populate(taskListPopulate);

    return updatedTask;
};

const getDashboardData = async () => { 
    const [taskDistributionRaw, taskPriorityLevelRaw, overdueTasks, recentTasks] = await Promise.all([
        Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
        Task.countDocuments({ status: { $ne: 'Completed' }, dueDate: { $lt: new Date() } }),
        Task.find().sort({ createdAt: -1 }).limit(5).select('title status priority dueDate createdAt').lean()
    ]);

    const taskDistribution = TASK_STATUS.reduce((acc, status) => {
        acc[status.replace(/\s+/g, '')] = taskDistributionRaw.find(i => i._id === status)?.count || 0;
        return acc;
    }, {});
    taskDistribution['All'] = taskDistributionRaw.reduce((a, b) => a + b.count, 0);

    const taskPriorityLevel = TASK_PRIORITIES.reduce((acc, priority) => {
        acc[priority] = taskPriorityLevelRaw.find(i => i._id === priority)?.count || 0;
        return acc;
    }, {});

    return { 
        statistics: {
            totalTasks: taskDistribution['All'],
            pendingTasks: taskDistribution['Pending'] || 0,
            completedTasks: taskDistribution['Completed'] || 0,
            overdueTasks
        },
        charts: { taskDistribution, taskPriorityLevel },
        recentTasks
    };
}; 

const getUserDashboardData = async (userId) => { 
    try {
        const [taskDistributionRaw, taskPriorityLevelRaw, overdueTasks, recentTasks] = await Promise.all([
            Task.aggregate([{ $match: { assignedTo: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
            Task.aggregate([{ $match: { assignedTo: userId } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
            Task.countDocuments({ assignedTo: userId, status: { $ne: 'Completed' }, dueDate: { $lt: new Date() } }),
            Task.find({ assignedTo: userId }).sort({ createdAt: -1 }).limit(5).select('title status priority dueDate createdAt').lean()
        ]);

        const taskDistribution = TASK_STATUS.reduce((acc, status) => {
            acc[status.replace(/\s+/g, '')] = taskDistributionRaw.find(i => i._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution['All'] = taskDistributionRaw.reduce((a, b) => a + b.count, 0);

        const taskPriorityLevel = TASK_PRIORITIES.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelRaw.find(i => i._id === priority)?.count || 0;
            return acc;
        }, {});

        return { 
            statistics: {
                totalTasks: taskDistribution['All'],
                pendingTasks: taskDistribution['Pending'] || 0,
                completedTasks: taskDistribution['Completed'] || 0,
                overdueTasks
            },
            charts: { taskDistribution, taskPriorityLevel },
            recentTasks
        };
    } catch (error) {
        throw new Error('Error fetching user dashboard data: ' + error.message);
    }; 
}

export { 
    getTasks, 
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
};
