import express from "express";
import * as authService from "../services/authService.js";
import logger from "../config/logger.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

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

        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        logger.info(`User registered: ${email}`);
        return ApiSuccess.created(res, "User registered successfully", { user: response.user, token: response.token });
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

        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        logger.info(`User logged in: ${email}`);
        return ApiSuccess.ok(res, "User logged in successfully", { user: response.user, token: response.token });
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
        const {name, email, profilePicture, password} = req.body;

        if(!userId){
            await authService.getUserProfileById(userId);
            const apiError = ApiError.notFound("User not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        const updatedUser = await authService.updateUserProfile(userId, {name, email, profilePicture, password});

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
        res.clearCookie('refreshToken');
        logger.info(`User logged out: ${req.user.id}`);
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
        
        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        logger.info(`Token refreshed`);
        return ApiSuccess.ok(res, "Token refreshed successfully", { token: response.token });
    }catch(error){
        res.clearCookie('refreshToken');
        logger.error(`Token refresh failed: ${error.message}`);
        const apiError = ApiError.forbidden("Invalid or expired refresh token");
        return res.status(apiError.statusCode).json(apiError);
    }
};

export { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser, refreshToken };