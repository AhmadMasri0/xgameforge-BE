const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            user: {
                id: user._id,
                username, email,
                isAdmin: user.isAdmin
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid Email." });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password." });
        }


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
