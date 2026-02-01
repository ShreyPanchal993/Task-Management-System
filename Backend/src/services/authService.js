import express from "express";
import bcrypt from "bcryptjs";
import * as tokens from "./tokenService.js";
import * as authRepository from "../repositories/authRepository.js";

const registerUser = async (userDetails) => {
    try{
        const {password, adminInviteToken} = userDetails;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine Role
        const role = tokens.roleDetermine(adminInviteToken);

        // Register User in DB
        const user = await authRepository.registerUser({...userDetails, password: hashedPassword, role});

        // Generate JWT Token
        const token = tokens.generateToken(user.id);

        return { user, token };
    } catch(error){
        throw new Error (error.message);
    }
};

const loginUser = async (email, password) => {
    try{
        const user = await authRepository.loginUser(email, password);

        // Generate JWT Token
        const token = tokens.generateToken(user.id);
        return { user, token };
    } catch(error){
        throw new Error (error.message);
    }
}

const getUserProfile = async (userId) => {
    try{
        const user = await authRepository.getUserProfile(userId);
        return user;
    } catch(error){
        throw new Error (error.message);
    }
};

const updateUserProfile = async (userId, userData) => {
    try{
        const {name, email, profilePicture, password} = userData;

        const updatedData = {
            name: name,
            email: email,
            profilePicture: profilePicture
        };

        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedData.password = hashedPassword;
        }

        const user = await authRepository.updateUserProfileById(userId, updatedData);
        
        const token = tokens.generateToken(user.id);
        return user;
    } catch(error){
        throw new Error (error.message);
    }
};

export { registerUser, loginUser, getUserProfile, updateUserProfile };