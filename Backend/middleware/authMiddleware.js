const userModel = require('../models/User.model');
const teacherModel = require('../models/Teacher.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');

// Middleware to authenticate users
exports.authUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user; // Attach user info to the request
        next();
    } catch (err) {
        console.error("Error in authUser middleware:", err);
        res.status(401).json({ message: "Unauthorized" });
    }
};
// Middleware to authenticate teachers
exports.authTeacher = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const teacher = await Teacher.findById(decoded.id);

        if (!teacher) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = teacher; // Attach teacher info to the request
        next();
    } catch (err) {
        console.error("Error in authTeacher middleware:", err);
        res.status(401).json({ message: "Unauthorized" });
    }
};