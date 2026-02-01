import express from "express";
import * as authService from "../services/authService.js";

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

        res.status(201).json({ message: "User registered successfully", data: response });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message});
    }
};

const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        const response = await authService.loginUser(email, password);

        res.status(200).json({ message: "User logged in successfully", data: response });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message});
    }
};

const getUserProfile = async (req, res) => {
    try{
        const userId = req.user.id;

        const user = await authService.getUserProfile(userId);

        res.status(200).json({ message: "User profile fetched successfully", data: user });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message});
    }
};

const updateUserProfile = async (req, res) => {
    try{
        const userId = req.user.id;
        const {name, email, profilePicture, password} = req.body;

        if(!userId){
            await authService.getUserProfileById(userId);
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await authService.updateUserProfile(userId, {name, email, profilePicture, password});

        res.status(200).json({ message: "User profile updated successfully", data: updatedUser });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message});
    }
};

export { registerUser, loginUser, getUserProfile, updateUserProfile };