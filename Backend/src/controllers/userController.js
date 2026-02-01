import express from "express";
import * as userService from "../services/userService.js";

const getUsers = async (req, res) => {
    try{
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getUserById = async (req, res) => {
    try{
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.status(200).json(user);
    } catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export {getUsers, getUserById};