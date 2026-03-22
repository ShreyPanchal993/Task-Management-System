import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.join(process.cwd(), '.env')})

const app = express();
const defaultDevOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = process.env.NODE_ENV === "production"
    ? configuredOrigins
    : [...new Set([...configuredOrigins, ...defaultDevOrigins])];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
        credentials: true
    })
);

connectDB();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on PORT: ${PORT}`));
