import * as userRepository from "../repositories/userRepository.js";
import ApiError from "../utils/ApiError.js";

const getUsers = async (actor) => {
    const users =  await userRepository.getUsers(actor);
    return users;
};

const getUserById = async (userId) => {
    const user = await userRepository.getUserById(userId);
    return user;
};

const updateUserRole = async (actor, userId, role) => {
    const targetUser = await userRepository.getUserById(userId);

    if (targetUser.role === "super_admin") {
        throw ApiError.forbidden("Super admin role cannot be modified");
    }

    if (targetUser._id.toString() === actor.id.toString()) {
        throw ApiError.badRequest("You cannot change your own role");
    }

    return userRepository.updateUserRole(userId, role);
};

export {getUsers, getUserById, updateUserRole};
