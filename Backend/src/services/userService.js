import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/userRepository.js";

const getUsers = async () => {
    const users =  await userRepository.getUsers();
    return users;
};

const getUserById = async (userId) => {
    return await userRepository.getUserById(userId);
};

const deleteUser = async (userId) => {
    return await userRepository.deleteUser(userId);
};

export {getUsers, getUserById, deleteUser};