import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Token } from "../models/Token.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const saveRefreshToken = async (userId, refreshToken, deviceInfo = "unknown") => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Token.findOneAndUpdate(
        { userId, deviceInfo },
        { refreshToken: hashToken(refreshToken), expiresAt },
        { upsert: true, new: true }
    );
};

export const verifyRefreshToken = async (refreshToken) => {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const hashedRefreshToken = hashToken(refreshToken);
    
    const tokenDoc = await Token.findOne({ refreshToken: hashedRefreshToken });
    if (!tokenDoc) throw new Error("Refresh token not found or already used");
    if (tokenDoc.userId.toString() !== decoded.id) throw new Error("Token mismatch");
    
    return { decoded, tokenDoc };
};

export const deleteRefreshToken = async (refreshToken) => {
    await Token.findOneAndDelete({ refreshToken: hashToken(refreshToken) });
};

export const deleteAllUserTokens = async (userId) => {
    await Token.deleteMany({ userId });
};

export const rotateRefreshToken = async (oldRefreshToken, newRefreshToken, userId, deviceInfo = "unknown") => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const result = await Token.findOneAndUpdate(
        { refreshToken: hashToken(oldRefreshToken), userId },
        { refreshToken: hashToken(newRefreshToken), expiresAt, deviceInfo },
        { new: true }
    );

    if (!result) {
        throw new Error("Refresh token not found or already rotated");
    }

    return result;
};

