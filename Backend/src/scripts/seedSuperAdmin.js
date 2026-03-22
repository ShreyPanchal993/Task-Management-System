import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required.");
}

if (!email) {
    throw new Error("Usage: npm run seed:super-admin -- <email>");
}

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOneAndUpdate(
        { email },
        { role: "super_admin" },
        { new: true }
    ).select("name email role");

    if (!user) {
        throw new Error(`No user found for ${email}`);
    }

    process.stdout.write(
        `Promoted ${user.email} to ${user.role}.\n`
    );
};

run()
    .catch((error) => {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
