import * as userService from "../services/userService.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import ApiError from "../utils/ApiError.js";

const resolveApiError = (error) => (
    error instanceof ApiError
        ? error
        : ApiError.internal(error.message)
);

const getUsers = async (req, res) => {
    try{
        const users = await userService.getUsers();
        return ApiSuccess.ok(res, "Users fetched successfully", users);
    } catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const getUserById = async (req, res) => {
    try{
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        return ApiSuccess.ok(res, "User fetched successfully", user);
    } catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateUserRole = async (req, res) => {
    try{
        const updatedUser = await userService.updateUserRole(req.user, req.params.id, req.body.role);
        return ApiSuccess.ok(res, "User role updated successfully", updatedUser);
    } catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

export {getUsers, getUserById, updateUserRole};
