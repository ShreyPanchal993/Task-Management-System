import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        profilePicture: {
            type: String,
            default: ""
        },
        role: {
            type: String,
            enum: ["super_admin", "admin", "member"],
            default: "member"
        },
    },{
        timestamps: true
    },
);

userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

export default User
