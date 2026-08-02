import Joi from "joi";

const profilePictureSchema = Joi.alternatives().try(
    Joi.string().trim().uri({ scheme: ["http", "https"] }),
    Joi.string().trim().pattern(/^profile-pictures\/[A-Za-z0-9][A-Za-z0-9._-]*$/)
).allow("");

export const registerSchema = {
    body: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().email().max(255).required(),
        password: Joi.string().min(8).max(128).required(),
        profilePicture: profilePictureSchema.optional(),
    }),
};

export const loginSchema = {
    body: Joi.object({
        email: Joi.string().trim().email().max(255).required(),
        password: Joi.string().min(1).max(128).required(),
    }),
};

export const updateProfileSchema = {
    body: Joi.object({
        name: Joi.string().trim().min(2).max(100).optional(),
        email: Joi.string().trim().email().max(255).optional(),
        profilePicture: profilePictureSchema.optional(),
        currentPassword: Joi.string().min(8).max(128).when("newPassword", {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        newPassword: Joi.string().min(8).max(128).optional(),
    }).or("name", "email", "profilePicture", "newPassword"),
};
