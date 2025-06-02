const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendUserConfirmation } = require("../utils/sendEmail");


exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
        });

        const confirmToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        await sendUserConfirmation(email, username, confirmToken)

        return res.status(201).json({
            message: "User registered successfully. Please check your email to confirm your account.",
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email." });

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please confirm your email to log in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password." });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

exports.confirmEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(400).json({ message: "Invalid or expired token." });

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "Email confirmed successfully." });
    } catch (err) {
        console.error("Email confirmation error:", err);
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};
