import * as taskService from '../services/taskService.js';
import ApiSuccess from '../utils/ApiSuccess.js';
import ApiError from '../utils/ApiError.js';
import { canManageAllTasks } from '../utils/taskHelpers.js';

const resolveApiError = (error) => (
    error instanceof ApiError
        ? error
        : ApiError.internal(error.message)
);

const getTasks = async (req, res) => {
    const filter = {};

    try {
        const { status } = req.validated?.query || req.query;
        if (status) {
            filter.status = status;
        }

        const tasks = await taskService.getTasks(req.user, filter);
        return ApiSuccess.ok(res, "Tasks fetched successfully", tasks);
    } catch (error) {
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getTaskById = async (req, res) => {
    try{
        const task = await taskService.getAccessibleTaskById(req.params.id, req.user);
        return ApiSuccess.ok(res, "Task fetched successfully", task);
    } catch (error) {
        const apiError = resolveApiError(error);
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
        }, req.user);

        return ApiSuccess.created(res, "Task created successfully", newTask);
    } catch (error) {
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateTask = async (req, res) => {
    try{
        const task = await taskService.getAccessibleTaskById(req.params.id, req.user);

        const updatedTask = await taskService.updateTask(task, req.body, req.user);

        return ApiSuccess.ok(res, "Task updated successfully", updatedTask);
    } catch (error) {
        const apiError = resolveApiError(error);
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
        return ApiSuccess.ok(res, "Task deleted successfully");
    } catch (error) {
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};     

const updateTaskStatus = async (req, res) => { 
    try{
        const task = await taskService.getAccessibleTaskById(req.params.id, req.user);

        const updatedTask = await taskService.updateTaskStatus(task, req.body.status, req.user);

        return ApiSuccess.ok(res, "Task status updated successfully", updatedTask);
    } catch (error) {
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateTaskChecklist = async (req, res) => { 
    try{
        const { todoChecklist } = req.body;

        const task = await taskService.getAccessibleTaskById(req.params.id, req.user);

        const isAssigned = task.assignedTo.some(user => user._id.toString() === req.user._id.toString());
        if (!isAssigned && !canManageAllTasks(req.user)) {
            const apiError = ApiError.forbidden("Unauthorized to update this task's checklist");
            return res.status(apiError.statusCode).json(apiError);
        }

        const updatedTask = await taskService.updateTaskChecklist(task, todoChecklist);
        return ApiSuccess.ok(res, "Task checklist updated successfully", updatedTask);
    } catch (error) {
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getDashboardData = async (req, res) => { 
    try {
        const data = await taskService.getDashboardData();
        return ApiSuccess.ok(res, "Dashboard data fetched successfully", data);
    } catch (error) {
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getUserDashboardData = async (req, res) => { 
    try {
        const userId = req.user._id;
        const data = await taskService.getUserDashboardData(userId);
        return ApiSuccess.ok(res, "User dashboard data fetched successfully", data);
    } catch (error) {
        const apiError = resolveApiError(error);
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
