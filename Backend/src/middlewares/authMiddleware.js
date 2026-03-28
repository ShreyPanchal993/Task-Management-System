import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../config/logger.js";

const protect = async (req, res, next) => {
    try{
        const bearerToken = req.headers.authorization?.startsWith("Bearer")
            ? req.headers.authorization.split(" ")[1]
            : null;
        const token = req.cookies?.accessToken || bearerToken;

        if (!token) {
            logger.warn("Auth rejected: missing access token", {
                method: req.method,
                url: req.originalUrl,
                origin: req.get("origin") || null,
                hasBearerToken: Boolean(bearerToken),
                hasAccessCookie: Boolean(req.cookies?.accessToken),
                hasRefreshCookie: Boolean(req.cookies?.refreshToken),
                ip: req.ip,
            });
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            logger.warn("Auth rejected: token user not found", {
                method: req.method,
                url: req.originalUrl,
                userId: decoded.id,
                ip: req.ip,
            });
            return res.status(401).json({ message: "User not found for token" });
        }

        next();
    } catch(error){
        logger.error("Auth middleware failed", {
            method: req.method,
            url: req.originalUrl,
            origin: req.get("origin") || null,
            hasAccessCookie: Boolean(req.cookies?.accessToken),
            hasRefreshCookie: Boolean(req.cookies?.refreshToken),
            error: error.message,
            stack: error.stack,
            ip: req.ip,
        });
        res.status(401).json({ message: "Token failed" });
    };
};

const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "super_admin")){
        next();
    } else {
        logger.warn("Access denied: admin only route", {
            method: req.method,
            url: req.originalUrl,
            userId: req.user?._id?.toString?.() || req.user?.id || null,
            role: req.user?.role || null,
            ip: req.ip,
        });
        res.status(403).json({ message: "Access denied, admin only"});
    }
};

const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === "super_admin") {
        next();
    } else {
        logger.warn("Access denied: super admin only route", {
            method: req.method,
            url: req.originalUrl,
            userId: req.user?._id?.toString?.() || req.user?.id || null,
            role: req.user?.role || null,
            ip: req.ip,
        });
        res.status(403).json({ message: "Access denied, super admin only" });
    }
};

export { protect, adminOnly, superAdminOnly };
