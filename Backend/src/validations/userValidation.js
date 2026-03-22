import Joi from "joi";
import { objectIdSchema } from "../middlewares/validateRequest.js";

export const userIdParamSchema = {
    params: Joi.object({
        id: objectIdSchema.required(),
    }),
};
