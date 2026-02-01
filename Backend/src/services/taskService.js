import * as taskRepository from '../repositories/taskRepository.js';

const getTasks = async (user, filter = {}) => { 
    const tasks = await taskRepository.getTasks(user, filter);
    return tasks;
};

const getTaskById = async (taskId) => { 
    const task = await taskRepository.getTaskById(taskId);   
    return task;
};

const createTask = async (taskData) => { 
    const newTask = await taskRepository.createTask(taskData);
    return newTask;
}; 

const updateTask = async (task, taskData, user) => { 
    task.title = taskData.title || task.title;
    task.description = taskData.description || task.description;
    task.priority = taskData.priority || task.priority;
    task.dueDate = taskData.dueDate || task.dueDate;
    task.todoChecklist = taskData.todoChecklist || task.todoChecklist;
    task.attachments = taskData.attachments || task.attachments;

    if (taskData.assignedTo) {
        if (!Array.isArray(taskData.assignedTo)) {
            throw new Error('assignedTo must be an array of user IDs');
        }
        task.assignedTo = taskData.assignedTo;
    }

    const updatedTask = await taskRepository.updateTask(task);
    return updatedTask;
};

const deleteTask = async (taskId) => { 
    const deleted = await taskRepository.deleteTask(taskId);
    return deleted;
};   

const updateTaskStatus = async (task, status, user) => { 
    const isAssigned = task.assignedTo.some(userId => userId.toString() === user._id.toString());
    if (user.role !== 'admin' && !isAssigned) {
        throw new Error("Unauthorized to update this task's status");
    }
    
    task.status = status;

    if (task.status === 'Completed') {
        task.todoChecklist.forEach(item => item.completed = true);
        task.progress = 100;
    }
    const updatedTask = await taskRepository.updateTask(task);
    return updatedTask;
};

const updateTaskChecklist = async (task, todoChecklist) => { 
    task.todoChecklist = todoChecklist;

    const completedCount = todoChecklist.filter(item => item.completed).length;
    const totalItems = todoChecklist.length;
    task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    if (task.progress === 100) {
        task.status = 'Completed';
    }else if (task.progress > 0) {
        task.status = 'In Progress';
    } else {
        task.status = 'Pending';
    }   

    const updatedTask = await taskRepository.updateTask(task);
    return updatedTask;
};

const getDashboardData = async () => {
    const dashboardData = await taskRepository.getDashboardData();
    return dashboardData;
};

const getUserDashboardData = async (user) => { };   

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