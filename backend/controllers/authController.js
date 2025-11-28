import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, first_name, last_name, email, password, phone_number, role } = req.body;

    if (!username || !first_name || !last_name || !email || !password || !phone_number) {
        return res.status(400).json({ message: "Please fill in all required fields" });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            first_name,
            last_name,
            email,
            password: hashedPassword,
            phone_number,
            role
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        } });

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Server error" });
        
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }


        const accessToken = jwt.sign(
            { 
                userId: user._id, 
                role: user.role 
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { 
                userId: user._id, 
                role: user.role 
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",   // ← required for frontend hosted separately
            path: "/",
        });

        res.status(200).json({ 
            accessToken, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const newAccessToken = jwt.sign(
            { 
                userId: user._id,   
                role: user.role 
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ accessToken: newAccessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
         });


    }catch (error) {
        console.error("Error verifying refresh token:", error);
        return res.status(403).json({ message: "Server Error" });
    }
}

export const logout = (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ message: "Logged out successfully" });

    }
    catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Server error" });
    }
}