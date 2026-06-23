import rateLimit from "express-rate-limit";
import logger from "../config/logger.js";

const standardHandler = (message, scope) => ({
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn("Rate limit exceeded", {
            scope,
            method: req.method,
            url: req.originalUrl,
            origin: req.get("origin") || null,
            ip: req.ip,
            userId: req.user?._id?.toString?.() || req.user?.id || null,
        });
        res.status(429).json({
            success: false,
            message,
        });
    },
});

export const authLimiter = rateLimit({
    ...standardHandler("Too many authentication attempts. Please try again later.", "auth"),
    max: 10,
});

export const refreshLimiter = rateLimit({
    ...standardHandler("Too many token refresh attempts. Please try again later.", "refresh"),
    max: 20,
});

export const uploadLimiter = rateLimit({
    ...standardHandler("Too many upload attempts. Please try again later.", "upload"),
    max: 20,
});
