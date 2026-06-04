import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true
        },
        deviceInfo: {
            type: String,
            default: "unknown"
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ userId: 1 });

export const Token = mongoose.model("Token", tokenSchema);
