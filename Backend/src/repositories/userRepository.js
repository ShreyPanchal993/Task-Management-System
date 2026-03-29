import User from "../models/User.js";
import Task from "../models/Task.js";
import ApiError from "../utils/ApiError.js";

const getUsers = async () => {
    const [users, taskCounts] = await Promise.all([
        User.find({ role: { $in: ["member", "admin"] } }).select("-password").lean(),
        Task.aggregate([
            { $unwind: "$assignedTo" },
            {
                $group: {
                    _id: "$assignedTo",
                    pendingTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
                        },
                    },
                    inProgressTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0],
                        },
                    },
                    completedTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
                        },
                    },
                },
            },
        ]),
    ]);

    const taskCountMap = new Map(
        taskCounts.map((item) => [item._id.toString(), item])
    );

    return users.map((user) => {
        const counts = taskCountMap.get(user._id.toString());

        return {
            ...user,
            pendingTasks: counts?.pendingTasks || 0,
            inProgressTasks: counts?.inProgressTasks || 0,
            completedTasks: counts?.completedTasks || 0,
        };
    });
};

const getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
        throw ApiError.notFound("User not found");
    }

    return user;
};

const updateUserRole = async (userId, role) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
    ).select("-password").lean();

    if (!user) {
        throw ApiError.notFound("User not found");
    }

    return user;
};

export {getUsers, getUserById, updateUserRole};
