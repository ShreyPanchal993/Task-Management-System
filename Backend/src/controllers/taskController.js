import * as taskService from '../services/taskService.js';

const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) {
            filter.status = status;
        }

        const tasks = await taskService.getTasks(req.user, filter);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};

const getTaskById = async (req, res) => {
    try{
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};

const createTask = async (req, res) => { 
    try{
        const {title, description, priority, dueDate, assignedTo, attachments, todoChecklist} = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs" }); 
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

        res.status(201).json({ message:"Task created successfully", task: newTask });
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};

const updateTask = async (req, res) => {
    try{
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const updatedTask = await taskService.updateTask(task, req.body, req.user);
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.json({ message: "Task updated successfully", updatedTask });
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};

const deleteTask = async (req, res) => { 
    try{
        const deleted = await taskService.deleteTask(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};     

const updateTaskStatus = async (req, res) => { 
    try{
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const updatedTask = await taskService.updateTaskStatus(task, req.body.status, req.user);
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};

const updateTaskChecklist = async (req, res) => { 
    try{
        const { todoChecklist } = req.body;

        const task = await taskService.getTaskById(req.params.id);  
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const isAssigned = task.assignedTo.some(user => user._id.toString() === req.user._id.toString());
        if (!isAssigned && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized to update this task's checklist" });
        }

        const updatedTask = await taskService.updateTaskChecklist(task, todoChecklist);
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }
        res.json({ message: "Task checklist updated successfully", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};

const getDashboardData = async (req, res) => { 
    try {
        const data = await taskService.getDashboardData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
    }
};

const getUserDashboardData = async (req, res) => { 
    try {
        const userId = req.user._id;
        const data = await taskService.getUserDashboardData(userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message:"Server error: ", error: error.message });
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