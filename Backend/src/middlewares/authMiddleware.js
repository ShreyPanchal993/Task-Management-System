import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try{
        const bearerToken = req.headers.authorization?.startsWith("Bearer")
            ? req.headers.authorization.split(" ")[1]
            : null;
        const token = req.cookies?.accessToken || bearerToken;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found for token" });
        }

        next();
    } catch(error){
        res.status(401).json({ message: "Token failed" });
    };
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role == "admin"){
        next();
    } else {
        res.status(403).json({ message: "Access denied, admin only"});
    }
};

export { protect, adminOnly };
