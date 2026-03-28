import * as taskService from '../services/taskService.js';
import logger from '../config/logger.js';
import ApiSuccess from '../utils/ApiSuccess.js';
import ApiError from '../utils/ApiError.js';

const canManageAllTasks = (user) => user.role === "admin" || user.role === "super_admin";
const getRequestContext = (req, extra = {}) => ({
    method: req.method,
    url: req.originalUrl,
    origin: req.get("origin") || null,
    userId: req.user?._id?.toString?.() || req.user?.id || null,
    ip: req.ip,
    params: req.params,
    query: req.query,
    ...extra,
});

const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) {
            filter.status = status;
        }

        const tasks = await taskService.getTasks(req.user, filter);
        return ApiSuccess.ok(res, "Tasks fetched successfully", tasks);
    } catch (error) {
        logger.error("Get tasks failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
            filter,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getTaskById = async (req, res) => {
    try{
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            const apiError = ApiError.notFound("Task not found");
            return res.status(apiError.statusCode).json(apiError);
        }
        return ApiSuccess.ok(res, "Task fetched successfully", task);
    } catch (error) {
        logger.error("Get task by ID failed", getRequestContext(req, {
            taskId: req.params.id,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const createTask = async (req, res) => { 
    try{
        const {title, description, priority, dueDate, assignedTo, attachments, todoChecklist} = req.body;

        if (!Array.isArray(assignedTo)) {
            const apiError = ApiError.badRequest("assignedTo must be an array of user IDs");
            return res.status(apiError.statusCode).json(apiError);
        }

        const newTask = await taskService.createTask({
            title, 
            description, 
            priority, 
            dueDate, 
            assignedTo, 
            createdBy: req.user._id,
            attachments, 
            todoChecklist
        });

        logger.info("Task created", getRequestContext(req, {
            taskId: newTask._id?.toString?.(),
            assignedCount: Array.isArray(assignedTo) ? assignedTo.length : 0,
        }));
        return ApiSuccess.created(res, "Task created successfully", newTask);
    } catch (error) {
        logger.error("Create task failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
            title: req.body?.title || null,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateTask = async (req, res) => {
    try{
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            const apiError = ApiError.notFound("Task not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        const updatedTask = await taskService.updateTask(task, req.body, req.user);
        if (!updatedTask) {
            const apiError = ApiError.notFound("Task not found or unauthorized");
            return res.status(apiError.statusCode).json(apiError);
        }

        logger.info("Task updated", getRequestContext(req, { taskId: req.params.id }));
        return ApiSuccess.ok(res, "Task updated successfully", updatedTask);
    } catch (error) {
        logger.error("Update task failed", getRequestContext(req, {
            taskId: req.params.id,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const deleteTask = async (req, res) => { 
    try{
        const deleted = await taskService.deleteTask(req.params.id);
        if (!deleted) {
            const apiError = ApiError.notFound("Task not found");
            return res.status(apiError.statusCode).json(apiError);
        }
        logger.info("Task deleted", getRequestContext(req, { taskId: req.params.id }));
        return ApiSuccess.ok(res, "Task deleted successfully");
    } catch (error) {
        logger.error("Delete task failed", getRequestContext(req, {
            taskId: req.params.id,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};     

const updateTaskStatus = async (req, res) => { 
    try{
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            const apiError = ApiError.notFound("Task not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        const updatedTask = await taskService.updateTaskStatus(task, req.body.status, req.user);
        if (!updatedTask) {
            const apiError = ApiError.notFound("Task not found or unauthorized");
            return res.status(apiError.statusCode).json(apiError);
        }

        logger.info("Task status updated", getRequestContext(req, {
            taskId: req.params.id,
            status: req.body?.status || null,
        }));
        return ApiSuccess.ok(res, "Task status updated successfully", updatedTask);
    } catch (error) {
        logger.error("Update task status failed", getRequestContext(req, {
            taskId: req.params.id,
            status: req.body?.status || null,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateTaskChecklist = async (req, res) => { 
    try{
        const { todoChecklist } = req.body;

        const task = await taskService.getTaskById(req.params.id);  
        if (!task) {
            const apiError = ApiError.notFound("Task not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        const isAssigned = task.assignedTo.some(user => user._id.toString() === req.user._id.toString());
        if (!isAssigned && !canManageAllTasks(req.user)) {
            const apiError = ApiError.forbidden("Unauthorized to update this task's checklist");
            return res.status(apiError.statusCode).json(apiError);
        }

        const updatedTask = await taskService.updateTaskChecklist(task, todoChecklist);
        if (!updatedTask) {
            const apiError = ApiError.notFound("Task not found or unauthorized");
            return res.status(apiError.statusCode).json(apiError);
        }
        logger.info("Task checklist updated", getRequestContext(req, {
            taskId: req.params.id,
            checklistItems: Array.isArray(todoChecklist) ? todoChecklist.length : 0,
        }));
        return ApiSuccess.ok(res, "Task checklist updated successfully", updatedTask);
    } catch (error) {
        logger.error("Update task checklist failed", getRequestContext(req, {
            taskId: req.params.id,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getDashboardData = async (req, res) => { 
    try {
        const data = await taskService.getDashboardData();
        return ApiSuccess.ok(res, "Dashboard data fetched successfully", data);
    } catch (error) {
        logger.error("Get dashboard data failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getUserDashboardData = async (req, res) => { 
    try {
        const userId = req.user._id;
        const data = await taskService.getUserDashboardData(userId);
        return ApiSuccess.ok(res, "User dashboard data fetched successfully", data);
    } catch (error) {
        logger.error("Get user dashboard data failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
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
