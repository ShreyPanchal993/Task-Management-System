import User from "../models/User.js";
import Task from "../models/Task.js";

const getUsers = async (userId) => {
    try{
        const users = await User.find({role: 'member'}).select('-password');

            // Add task count for each user
            const usersWithTaskCount = await Promise.all(users.map(async (user) => {
                const pendingTasks = await Task.countDocuments({assignedTo: user._id, status: 'pending'});
                const inProgressTasks = await Task.countDocuments({assignedTo: user._id, status: 'in-progress'});
                const completedTasks = await Task.countDocuments({assignedTo: user._id, status: 'completed'});
                return {
                    ...user._doc, 
                    pendingTasks: pendingTasks, 
                    inProgressTasks: inProgressTasks, 
                    completedTasks: completedTasks
                };
            }));

        return usersWithTaskCount;
    } catch(error){
        throw new Error(error.message);
    }
};

const getUserById = async (userId) => {
    try{
        return await User.findById(userId);
    } catch(error){
        throw new Error(error.message);
    }
};

const deleteUser = async (userId) => {
    try{
        return await User.findByIdAndDelete(userId);
    } catch(error){
        throw new Error(error.message);
    }
};

export {getUsers, getUserById, deleteUser};