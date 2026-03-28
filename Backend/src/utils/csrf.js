import crypto from "crypto";
import { csrfCookieOptions, clearCookieOptions } from "./cookieOptions.js";

const CSRF_COOKIE_NAME = "csrfToken";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");

export const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const setCsrfCookie = (res, csrfToken = generateCsrfToken()) => {
    res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions);
    return csrfToken;
};

export const clearCsrfCookie = (res) => {
    res.clearCookie(CSRF_COOKIE_NAME, clearCookieOptions);
};

export const issueCsrfToken = (req, res) => {
    const csrfToken = setCsrfCookie(res);
    return res.status(200).json({
        success: true,
        message: "CSRF token issued successfully",
        data: { csrfToken },
    });
};

export const requireCsrfProtection = (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.get("X-CSRF-Token");
    const requestOrigin = req.get("Origin") || "";
    const allowedOrigins = (process.env.CLIENT_URL || "")
        .split(",")
        .map(normalizeOrigin)
        .filter(Boolean);
    const isTrustedOrigin = requestOrigin && allowedOrigins.includes(normalizeOrigin(requestOrigin));

    if (headerToken && isTrustedOrigin && !cookieToken) {
        return next();
    }

    if (!cookieToken || !headerToken) {
        return res.status(403).json({
            success: false,
            message: "CSRF token missing",
        });
    }

    const cookieBuffer = Buffer.from(cookieToken, "utf8");
    const headerBuffer = Buffer.from(headerToken, "utf8");

    if (
        cookieBuffer.length !== headerBuffer.length ||
        !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
        return res.status(403).json({
            success: false,
            message: "Invalid CSRF token",
        });
    }

    next();
};
