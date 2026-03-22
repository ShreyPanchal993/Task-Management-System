import * as taskRepository from '../repositories/taskRepository.js';
import { normalizeTaskInput } from "../utils/inputSecurity.js";

const getTasks = async (user, filter = {}) => { 
    const tasks = await taskRepository.getTasks(user, filter);
    return tasks;
};

const getTaskById = async (taskId) => { 
    const task = await taskRepository.getTaskById(taskId);   
    return task;
};

const createTask = async (taskData) => { 
    const normalizedTaskData = normalizeTaskInput(taskData);
    const newTask = await taskRepository.createTask(normalizedTaskData);
    return newTask;
}; 

const updateTask = async (task, taskData, user) => { 
    const normalizedTaskData = normalizeTaskInput(taskData);

    task.title = normalizedTaskData.title || task.title;
    task.description = normalizedTaskData.description || task.description;
    task.priority = normalizedTaskData.priority || task.priority;
    task.dueDate = normalizedTaskData.dueDate || task.dueDate;
    task.todoChecklist = normalizedTaskData.todoChecklist || task.todoChecklist;
    task.attachments = normalizedTaskData.attachments || task.attachments;

    if (normalizedTaskData.assignedTo) {
        if (!Array.isArray(normalizedTaskData.assignedTo)) {
            throw new Error('assignedTo must be an array of user IDs');
        }
        task.assignedTo = normalizedTaskData.assignedTo;
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
    const normalizedChecklist = normalizeTaskInput({ todoChecklist }).todoChecklist;
    task.todoChecklist = normalizedChecklist;

    const completedCount = normalizedChecklist.filter(item => item.completed).length;
    const totalItems = normalizedChecklist.length;
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

const getUserDashboardData = async (userId) => { 
    const dashboardData = await taskRepository.getUserDashboardData(userId);
    return dashboardData;
};   

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
