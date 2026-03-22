import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as tokens from "./tokenService.js";
import * as authRepository from "../repositories/authRepository.js";
import { normalizeProfileUpdateInput, normalizeUserInput } from "../utils/inputSecurity.js";

const registerUser = async (userDetails) => {
    const { password, adminInviteToken, ...restUserDetails } = userDetails;
    const normalizedUser = normalizeUserInput({ ...restUserDetails, adminInviteToken });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = tokens.roleDetermine(normalizedUser.adminInviteToken);
    const user = await authRepository.registerUser({
        ...normalizedUser,
        password: hashedPassword,
        role,
    });

    const accessToken = tokens.generateToken(user.id);
    const refreshToken = tokens.generateRefreshToken(user.id);

    await tokens.saveRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
};

const loginUser = async (email, password, deviceInfo) => {
    const user = await authRepository.loginUser(email?.trim().toLowerCase(), password);

    const accessToken = tokens.generateToken(user.id);
    const refreshToken = tokens.generateRefreshToken(user.id);

    await tokens.saveRefreshToken(user.id, refreshToken, deviceInfo);

    return { user, accessToken, refreshToken };
}

const getUserProfile = async (userId) => {
    const user = await authRepository.getUserProfile(userId);
    return user;
};

const updateUserProfile = async (userId, userData) => {
    const { name, email, profilePicture, currentPassword, newPassword } = userData;

    const updatedData = normalizeProfileUpdateInput({ name, email, profilePicture });

    if (newPassword) {
        const user = await authRepository.getUserWithPassword(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect.');
        }
        const salt = await bcrypt.genSalt(10);
        updatedData.password = await bcrypt.hash(newPassword, salt);
    }

    const user = await authRepository.updateUserProfileById(userId, updatedData);
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
    
    return { accessToken: tokens.generateToken(decoded.id), refreshToken: newRefreshToken };
};

export { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser, logoutAllDevices, refreshAccessToken };
