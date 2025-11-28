import { parse } from "dotenv";
import User from "../models/User.js";

export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await User.countDocuments();

        const users = await User.find().skip(skip).limit(limit).select("-password");

        res.status(200).json({
            users,
            total,
            page,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
            

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndDelete(req.params.id); 

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


export const getProfile = async (req, res) => {
  try {
    console.log("Decoded user from token:", req.user);

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      console.log("User not found for ID:", req.user.userId);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
