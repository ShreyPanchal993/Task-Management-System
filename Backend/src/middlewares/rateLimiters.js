import rateLimit from "express-rate-limit";

const standardHandler = (message) => ({
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message,
        });
    },
});

export const authLimiter = rateLimit({
    ...standardHandler("Too many authentication attempts. Please try again later."),
    max: 10,
});

export const refreshLimiter = rateLimit({
    ...standardHandler("Too many token refresh attempts. Please try again later."),
    max: 20,
});

export const uploadLimiter = rateLimit({
    ...standardHandler("Too many upload attempts. Please try again later."),
    max: 20,
});
