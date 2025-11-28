import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
  username: {
    type: String,
        required: true,
        unique: true,
  },
  
    first_name: {
        type: String,
        required: true,
  },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone_number: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        enum: ["meoadmin", "bfpadmin", "mayoradmin", "user"],
        default: "user",
    }
}, { timestamps: true});

export default mongoose.model("User", userSchema);