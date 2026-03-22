import Task from "../models/Task.js";
import { TASK_STATUS, TASK_PRIORITIES } from "../constants/constants.js";

const getTasks = async (user, filter = {}) => { 
    const baseFilter = user.role === 'admin' ? filter : { ...filter, assignedTo: user._id };

    const [tasksRaw, statusCounts] = await Promise.all([
        Task.find(baseFilter).populate('assignedTo', 'name email profilePicture').lean(),
        Task.aggregate([
            { $match: user.role === 'admin' ? {} : { assignedTo: user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
    ]);

    const tasks = tasksRaw.map(task => ({
        ...task,
        completedTodoCount: task.todoChecklist.filter(item => item.completed).length
    }));

    const countMap = statusCounts.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {});
    const allTasks = Object.values(countMap).reduce((a, b) => a + b, 0);

    return { 
        tasks, 
        statusSummary: {
            all: allTasks, 
            pendingTasks: countMap['Pending'] || 0, 
            inProgressTasks: countMap['In Progress'] || 0, 
            completedTasks: countMap['Completed'] || 0
        } 
    };
};

const getTaskById = async (taskId) => { 
    const task = await Task.findById(taskId).populate('assignedTo', 'name email profilePicture');   
    if (!task) {
        throw new Error('Task not found');
    }
    return task;
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
    ).populate('assignedTo', 'name email profilePicture');
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
    ).populate('assignedTo', 'name email profilePicture');
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
    ).populate('assignedTo', 'name email profilePicture');

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