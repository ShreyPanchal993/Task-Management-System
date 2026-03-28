import Joi from "joi";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

const requestTargets = ["body", "query", "params"];

const joiOptions = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
};

export const objectIdSchema = Joi.string().hex().length(24);

export const validateRequest = (schemas = {}) => (req, res, next) => {
    try {
        req.validated = req.validated || {};

        for (const target of requestTargets) {
            const schema = schemas[target];

            if (!schema) {
                continue;
            }

            const { error, value } = schema.validate(req[target], joiOptions);

            if (error) {
                const message = error.details.map((detail) => detail.message).join(", ");
                logger.warn("Request validation failed", {
                    method: req.method,
                    url: req.originalUrl,
                    target,
                    message,
                    details: error.details.map((detail) => ({
                        message: detail.message,
                        path: detail.path,
                        type: detail.type,
                    })),
                    userId: req.user?._id?.toString?.() || req.user?.id || null,
                    ip: req.ip,
                });
                const apiError = ApiError.badRequest(message, error.details);
                return res.status(apiError.statusCode).json(apiError);
            }

            if (target === "body") {
                req.body = value;
            }

            req.validated[target] = value;
        }

        next();
    } catch (error) {
        logger.error("Request validation middleware crashed", {
            method: req.method,
            url: req.originalUrl,
            error: error.message,
            stack: error.stack,
            ip: req.ip,
        });
        const apiError = ApiError.badRequest(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};
