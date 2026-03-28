import express from "express";
import * as authService from "../services/authService.js";
import logger from "../config/logger.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";
import { clearAuthCookies, setAuthCookies } from "../utils/cookieOptions.js";
import { clearCsrfCookie, setCsrfCookie } from "../utils/csrf.js";

const getRequestContext = (req, extra = {}) => ({
    method: req.method,
    url: req.originalUrl,
    origin: req.get("origin") || null,
    userId: req.user?._id?.toString?.() || req.user?.id || null,
    ip: req.ip,
    ...extra,
});

const registerUser = async (req, res) => {
    try{
        const { name, email, password, profilePicture } = req.body;
    
        const response = await authService.registerUser(
            {
                name, 
                email, 
                password, 
                profilePicture,
            }
        );

        setAuthCookies(res, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        const csrfToken = setCsrfCookie(res);

        logger.info("User registered", getRequestContext(req, { email }));
        return ApiSuccess.created(res, "User registered successfully", { user: response.user, csrfToken });
    }catch(error){
        logger.error("Registration failed", getRequestContext(req, {
            email: req.body?.email || null,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;
        const deviceInfo = req.headers['user-agent'] || 'unknown';

        const response = await authService.loginUser(email, password, deviceInfo);

        setAuthCookies(res, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        const csrfToken = setCsrfCookie(res);

        logger.info("User logged in", getRequestContext(req, { email }));
        return ApiSuccess.ok(res, "User logged in successfully", { user: response.user, csrfToken });
    }catch(error){
        logger.error("Login failed", getRequestContext(req, {
            email: req.body?.email || null,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getUserProfile = async (req, res) => {
    try{
        const userId = req.user.id;

        const user = await authService.getUserProfile(userId);

        return ApiSuccess.ok(res, "User profile fetched successfully", user);
    }catch(error){
        logger.error("Get profile failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateUserProfile = async (req, res) => {
    try{
        const userId = req.user.id;
        const { name, email, profilePicture, currentPassword, newPassword } = req.body;

        if (!userId) {
            const apiError = ApiError.notFound("User not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        const updatedUser = await authService.updateUserProfile(userId, { name, email, profilePicture, currentPassword, newPassword });

        logger.info("User profile updated", getRequestContext(req, { userId, email: email || null }));
        return ApiSuccess.ok(res, "User profile updated successfully", updatedUser);
    }catch(error){
        logger.error("Update profile failed", getRequestContext(req, {
            email: req.body?.email || null,
            error: error.message,
            stack: error.stack,
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const logoutUser = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await authService.logoutUser(refreshToken);
        }
        clearAuthCookies(res);
        clearCsrfCookie(res);
        logger.info("User logged out", getRequestContext(req, {
            hadRefreshCookie: Boolean(refreshToken),
        }));
        return ApiSuccess.ok(res, "User logged out successfully");
    }catch(error){
        logger.error("Logout failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
            hasRefreshCookie: Boolean(req.cookies?.refreshToken),
        }));
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const refreshToken = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            const apiError = ApiError.unauthorized("No refresh token");
            return res.status(apiError.statusCode).json(apiError);
        }
        
        const response = await authService.refreshAccessToken(refreshToken);
        
        setAuthCookies(res, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        const csrfToken = setCsrfCookie(res);
        
        logger.info("Token refreshed", getRequestContext(req, {
            hasRefreshCookie: Boolean(refreshToken),
        }));
        return ApiSuccess.ok(res, "Token refreshed successfully", { csrfToken });
    }catch(error){
        clearAuthCookies(res);
        clearCsrfCookie(res);
        logger.error("Token refresh failed", getRequestContext(req, {
            error: error.message,
            stack: error.stack,
            hasRefreshCookie: Boolean(req.cookies?.refreshToken),
        }));
        const apiError = ApiError.forbidden("Invalid or expired refresh token");
        return res.status(apiError.statusCode).json(apiError);
    }
};

export { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser, refreshToken };
