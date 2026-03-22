import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as tokens from "./tokenService.js";
import * as authRepository from "../repositories/authRepository.js";

const registerUser = async (userDetails) => {
    const {password, adminInviteToken} = userDetails;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = tokens.roleDetermine(adminInviteToken);
    const user = await authRepository.registerUser({...userDetails, password: hashedPassword, role});

    const token = tokens.generateToken(user.id);
    const refreshToken = tokens.generateRefreshToken(user.id);

    await tokens.saveRefreshToken(user.id, refreshToken);

    return { user, token, refreshToken };
};

const loginUser = async (email, password, deviceInfo) => {
    const user = await authRepository.loginUser(email, password);

    const token = tokens.generateToken(user.id);
    const refreshToken = tokens.generateRefreshToken(user.id);

    await tokens.saveRefreshToken(user.id, refreshToken, deviceInfo);

    return { user, token, refreshToken };
}

const getUserProfile = async (userId) => {
    const user = await authRepository.getUserProfile(userId);
    return user;
};

const updateUserProfile = async (userId, userData) => {
    const {name, email, profilePicture, password} = userData;

    const updatedData = { name, email, profilePicture };

    if(password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updatedData.password = hashedPassword;
    }

    const user = await authRepository.updateUserProfileById(userId, updatedData);
    
    const token = tokens.generateToken(user.id);
    return user;
};

const logoutUser = async (refreshToken) => {
    await tokens.deleteRefreshToken(refreshToken);
};

const logoutAllDevices = async (userId) => {
    await tokens.deleteAllUserTokens(userId);
};

const refreshAccessToken = async (refreshToken) => {
    const { decoded } = await tokens.verifyRefreshToken(refreshToken);
    
    await tokens.deleteRefreshToken(refreshToken);
    const newRefreshToken = tokens.generateRefreshToken(decoded.id);
    await tokens.saveRefreshToken(decoded.id, newRefreshToken);
    
    return { token: tokens.generateToken(decoded.id), refreshToken: newRefreshToken };
};

export { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser, logoutAllDevices, refreshAccessToken };