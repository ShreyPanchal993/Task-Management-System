import express from "express";
import * as userService from "../services/userService.js";
import logger from "../config/logger.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import ApiError from "../utils/ApiError.js";

const getUsers = async (req, res) => {
    try{
        const users = await userService.getUsers();
        return ApiSuccess.ok(res, "Users fetched successfully", users);
    } catch(error){
        logger.error(`Get users failed: ${error.message}`);
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getUserById = async (req, res) => {
    try{
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        return ApiSuccess.ok(res, "User fetched successfully", user);
    } catch(error){
        logger.error(`Get user by ID failed: ${error.message}`);
        const apiError = ApiError.internal(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateUserRole = async (req, res) => {
    try{
        const updatedUser = await userService.updateUserRole(req.user, req.params.id, req.body.role);
        logger.info(`User role updated by ${req.user.id}: ${req.params.id} -> ${req.body.role}`);
        return ApiSuccess.ok(res, "User role updated successfully", updatedUser);
    } catch(error){
        logger.error(`Update user role failed: ${error.message}`);
        const apiError = error.message === "User not found"
            ? ApiError.notFound(error.message)
            : ApiError.badRequest(error.message);
        return res.status(apiError.statusCode).json(apiError);
    }
};

export {getUsers, getUserById, updateUserRole};
