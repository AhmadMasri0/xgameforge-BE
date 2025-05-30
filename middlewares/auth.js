const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkToken = async (req, res, next) => {

    // console.log('token')
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const checkAdmin = (req, res, next) => {
    // console.log(req.user)

    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
    } catch {
        return res.json({ message: "Something went wrong." });

    }
    next();
};

module.exports = {
    checkToken,
    checkAdmin,
};