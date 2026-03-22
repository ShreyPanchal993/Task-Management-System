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

const updateUserRole = async (actor, userId, role) => {
    const targetUser = await userRepository.getUserById(userId);

    if (targetUser.role === "super_admin") {
        throw new Error("Super admin role cannot be modified");
    }

    if (targetUser._id.toString() === actor.id.toString()) {
        throw new Error("You cannot change your own role");
    }

    return userRepository.updateUserRole(userId, role);
};

export {getUsers, getUserById, updateUserRole};
