import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/userRepository.js";

const getUsers = async () => {
    const users =  await userRepository.getUsers();
    return users;
};

const getUserById = async (userId) => {
    const user = await userRepository.getUserById(userId);
    return user;
};

export {getUsers, getUserById};