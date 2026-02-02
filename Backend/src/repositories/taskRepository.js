import Task from "../models/Task.js";
import { TASK_STATUS, TASK_PRIORITIES } from "../constants/constants.js";

const getTasks = async (user, filter = {}) => { 
    let tasks;
    if (user.role === 'admin') {
        tasks = await Task.find(filter).populate('assignedTo', 'name email profilePicture');
    }else{
        tasks = await Task.find({ ...filter, assignedTo: user._id }).populate(
            'assignedTo', 
            'name email profilePicture'
        );
    }
    
    tasks = await Promise.all(
        tasks.map(async (task) => {
            const completedCount = await task.todoChecklist.filter(
                (item) => item.completed
            ).length;
            return { ...task._doc, completedTodoCount: completedCount };
        })
    );

    const allTasks = await Task.countDocuments(
        user.role === 'admin' ? {} : { assignedTo: user._id }
    );
    
    const pendingTasks = await Task.countDocuments({ 
        ...filter,
        status: 'Pending',
        ...(user.role !== 'admin' && { assignedTo: user._id }),
    });

    const inProgressTasks = await Task.countDocuments({ 
        ...filter,
        status: 'In Progress',
        ...(user.role !== 'admin' && { assignedTo: user._id }),
    });

    const completedTasks = await Task.countDocuments({ 
        ...filter,
        status: 'Completed',
        ...(user.role !== 'admin' && { assignedTo: user._id }),
    });

    return { 
        tasks, 
        statusSummary: {
            all: allTasks, 
            pendingTasks, 
            inProgressTasks, 
            completedTasks
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
    const updatedTask = await Task.findByIdAndUpdate(taskData._id, taskData, { new: true });
    return updatedTask;
};

const deleteTask = async (taskId) => { 
    const deleted = await Task.findByIdAndDelete(taskId);
    return deleted;
};

const updateTaskStatus = async (task) => { 
    const updatedTask = await Task.findByIdAndUpdate(task._id, task, { new: true });
    return updatedTask;
};

const updateTaskChecklist = async (task) => { 
    const updatedTask = await Task.findByIdAndUpdate(task._id, task, { new: true }).populate(
        'assignedTo', 
        'name email profilePicture'
    );

    return updatedTask;
};

const getDashboardData = async () => { 
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const overdueTasks = await Task.countDocuments({
        status: { $ne: 'Completed' },
        dueDate: { $lt: new Date() },
    });

    const taskDistributionRaw = await Task.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const taskDistribution = TASK_STATUS.reduce((acc, status) => {
        const formattedKey = status.replace(/\s+/g, '');
        acc[formattedKey] = 
            taskDistributionRaw.find(item => item._id === status)?.count || 0;
        return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    const taskPriorityLevelRaw = await Task.aggregate([
        {
            $group: {
                _id: '$priority',
                count: { $sum: 1 },
            },
        },
    ]);

    const taskPriorityLevel = TASK_PRIORITIES.reduce((acc, priority) => {
        acc[priority] =
            taskPriorityLevelRaw.find(item => item._id === priority)?.count || 0;
        return acc;
    }, {});

    const recentTasks = await Task.find()
        .sort({ createdAt: -1 })    
        .limit(5)
        .select('title status priority dueDate createdAt');

    return { 
        statistics:{
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks
        },
        charts: {
            taskDistribution,
            taskPriorityLevel
        },
        recentTasks
    };
}; 

const getUserDashboardData = async (userId) => { 
    try{
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() },
        });

        const taskDistributionRaw = await Task.aggregate([
            {
                $match: { assignedTo: userId }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskDistribution = TASK_STATUS.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, '');
            acc[formattedKey] = 
                taskDistributionRaw.find(item => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        const taskPriorityLevelRaw = await Task.aggregate([
            {
                $match: { assignedTo: userId }
            },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskPriorityLevel = TASK_PRIORITIES.reduce((acc, priority) => {
            acc[priority] =
                taskPriorityLevelRaw.find(item => item._id === priority)?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })    
            .limit(5)
            .select('title status priority dueDate createdAt');

        return { 
            statistics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPriorityLevel
            },
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