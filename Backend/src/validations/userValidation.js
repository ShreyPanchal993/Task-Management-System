import Joi from "joi";
import { objectIdSchema } from "../middlewares/validateRequest.js";

export const userIdParamSchema = {
    params: Joi.object({
        id: objectIdSchema.required(),
    }),
};

export const updateUserRoleSchema = {
    params: Joi.object({
        id: objectIdSchema.required(),
    }),
    body: Joi.object({
        role: Joi.string().valid("admin", "member").required(),
    }),
};
