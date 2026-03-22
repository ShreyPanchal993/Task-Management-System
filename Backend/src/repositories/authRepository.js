import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const registerUser = async (userDetails) => {
    try{
        const { name, email, password, profilePicture, role } = userDetails;
        const userExists = await User.findOne({ email });
        if (userExists){
            throw new Error ("User already exists with this email");
        }
        const user = await User.create({
            name,
            email,
            password,
            profilePicture,
            role
        });
        return ({ 
            id: user._id,
            name: user.name, 
            email: user.email, 
            profilePicture: user.profilePicture, 
            role: user.role 
        });
    } catch(error){
        throw new Error (error.message);
    };
};

const loginUser = async (email, password) => {
    try{
        const user = await User.findOne({email});
        if (!user){
            throw new Error ("Invalid email or password");
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            throw new Error ("Invalid email or password");
        }
        return ({ 
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture
        });
    } catch(error){
        throw new Error (error.message);
    }
};

const getUserProfile = async (userId) => {
    try{
        const user = await User.findById(userId).select("-password");   
        if (!user){
            throw new Error ("User not found");
        }
        return user;
    } catch(error){
        throw new Error (error.message);
    }
};

const updateUserProfileById = async (userId, updateData) => {
    try{
        const user = await User.findByIdAndUpdate (userId, updateData, { new: true }).select("-password");
        if (!user){
            throw new Error ("User not found");
        }
        return user;
    }   catch(error){
        throw new Error (error.message);
    }
};

const getUserWithPassword = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export { registerUser, loginUser, getUserProfile, getUserWithPassword, updateUserProfileById };