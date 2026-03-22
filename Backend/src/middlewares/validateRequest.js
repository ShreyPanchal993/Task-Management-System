import Joi from "joi";
import ApiError from "../utils/ApiError.js";

const requestTargets = ["body", "query", "params"];

const joiOptions = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
};

export const objectIdSchema = Joi.string().hex().length(24);

export const validateRequest = (schemas = {}) => (req, res, next) => {
    try {
        for (const target of requestTargets) {
            const schema = schemas[target];

            if (!schema) {
                continue;
            }

            const { error, value } = schema.validate(req[target], joiOptions);

            if (error) {
                const message = error.details.map((detail) => detail.message).join(", ");
                const apiError = ApiError.badRequest(message, error.details);
                return res.status(apiError.statusCode).json(apiError);
            }

            req[target] = value;
        }

        next();
    } catch (error) {
        const apiError = ApiError.badRequest(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};
