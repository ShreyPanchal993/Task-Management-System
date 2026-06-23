import User from "../models/User.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";

const registerUser = async (userDetails) => {
    const { name, email, password, profilePicture, role } = userDetails;
    const userExists = await User.exists({ email });

    if (userExists) {
        throw ApiError.conflict("User already exists with this email");
    }

    const user = await User.create({
        name,
        email,
        password,
        profilePicture,
        role,
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
    };
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
    };
};

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
        throw ApiError.notFound("User not found");
    }

    return user;
};

const updateUserProfileById = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).select("-password").lean();

    if (!user) {
        throw ApiError.notFound("User not found");
    }

    return user;
};

const getUserWithPassword = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw ApiError.notFound("User not found");
    }

    return user;
};

export { registerUser, loginUser, getUserProfile, getUserWithPassword, updateUserProfileById };
