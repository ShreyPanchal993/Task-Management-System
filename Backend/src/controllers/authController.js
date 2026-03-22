import express from "express";
import * as authService from "../services/authService.js";
import logger from "../config/logger.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";
import { clearAuthCookies, setAuthCookies } from "../utils/cookieOptions.js";
import { clearCsrfCookie, setCsrfCookie } from "../utils/csrf.js";

const registerUser = async (req, res) => {
    try{
        const { name, email, password, profilePicture, adminInviteToken } = req.body;
    
        const response = await authService.registerUser(
            {
                name, 
                email, 
                password, 
                profilePicture, 
                adminInviteToken 
            }
        );

        setAuthCookies(res, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        setCsrfCookie(res);

        logger.info(`User registered: ${email}`);
        return ApiSuccess.created(res, "User registered successfully", { user: response.user });
    }catch(error){
        logger.error(`Registration failed: ${error.message}`);
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
        setCsrfCookie(res);

        logger.info(`User logged in: ${email}`);
        return ApiSuccess.ok(res, "User logged in successfully", { user: response.user });
    }catch(error){
        logger.error(`Login failed: ${error.message}`);
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
        logger.error(`Get profile failed: ${error.message}`);
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

        logger.info(`User profile updated: ${userId}`);
        return ApiSuccess.ok(res, "User profile updated successfully", updatedUser);
    }catch(error){
        logger.error(`Update profile failed: ${error.message}`);
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
        logger.info(`User logged out`);
        return ApiSuccess.ok(res, "User logged out successfully");
    }catch(error){
        logger.error(`Logout failed: ${error.message}`);
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
        setCsrfCookie(res);
        
        logger.info(`Token refreshed`);
        return ApiSuccess.ok(res, "Token refreshed successfully");
    }catch(error){
        clearAuthCookies(res);
        clearCsrfCookie(res);
        logger.error(`Token refresh failed: ${error.message}`);
        const apiError = ApiError.forbidden("Invalid or expired refresh token");
        return res.status(apiError.statusCode).json(apiError);
    }
};

export { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser, refreshToken };
