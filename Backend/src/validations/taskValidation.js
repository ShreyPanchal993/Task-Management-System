import Joi from "joi";
import { objectIdSchema } from "../middlewares/validateRequest.js";

const todoItemSchema = Joi.alternatives().try(
    Joi.string().trim().min(1).max(300),
    Joi.object({
        text: Joi.string().trim().min(1).max(300).required(),
        completed: Joi.boolean().optional(),
    })
);

const attachmentSchema = Joi.string().trim().uri({ scheme: ["http", "https"] });

export const taskIdParamSchema = {
    params: Joi.object({
        id: objectIdSchema.required(),
    }),
};

export const getTasksQuerySchema = {
    query: Joi.object({
        status: Joi.string()
            .trim()
            .valid("Pending", "In Progress", "Completed")
            .empty("")
            .optional(),
    }),
};

export const createTaskSchema = {
    body: Joi.object({
        title: Joi.string().trim().min(3).max(200).required(),
        description: Joi.string().trim().max(2000).allow("").optional(),
        priority: Joi.string().valid("Low", "Medium", "High").required(),
        dueDate: Joi.date().iso().required(),
        assignedTo: Joi.array().items(objectIdSchema).min(1).required(),
        attachments: Joi.array().items(attachmentSchema).max(10).optional(),
        todoChecklist: Joi.array().items(todoItemSchema).min(1).required(),
    }),
};

export const updateTaskSchema = {
    body: Joi.object({
        title: Joi.string().trim().min(3).max(200).optional(),
        description: Joi.string().trim().max(2000).allow("").optional(),
        priority: Joi.string().valid("Low", "Medium", "High").optional(),
        dueDate: Joi.date().iso().optional(),
        assignedTo: Joi.array().items(objectIdSchema).min(1).optional(),
        attachments: Joi.array().items(attachmentSchema).max(10).optional(),
        todoChecklist: Joi.array().items(todoItemSchema).min(1).optional(),
    }).min(1),
};

export const updateTaskStatusSchema = {
    body: Joi.object({
        status: Joi.string().valid("Pending", "In Progress", "Completed").required(),
    }),
};

export const updateTaskChecklistSchema = {
    body: Joi.object({
        todoChecklist: Joi.array().items(
            Joi.object({
                text: Joi.string().trim().min(1).max(300).required(),
                completed: Joi.boolean().required(),
            })
        ).min(1).required(),
    }),
};
