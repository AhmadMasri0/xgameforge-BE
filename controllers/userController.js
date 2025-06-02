const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Both current and new passwords are required." });
        }

        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New password and confirm password do not match." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword; 
        await user.save();

        res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email, phone } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ error: 'User not found' });
        const existingUser = await User.findOne({ email });

        console.log(existingUser._id.toString(), req.user._id.toString())
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            return res.status(404).json({ error: 'This email already in-use.' });
        }
        user.username = username || user.username;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
};


