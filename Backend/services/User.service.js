const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class UserService {
  async register(userData) {
    const { name, usn, email, password, branch, semester } = userData;

    const userExists = await User.findOne({ $or: [{ email }, { usn }] });
    if (userExists) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      usn,
      email,
      password: hashedPassword,
      branch,
      semester,
    });

    return {
      _id: user._id,
      name: user.name,
      usn: user.usn,
      email: user.email,
      branch: user.branch,
      semester: user.semester,
      token: this.generateToken(user._id),
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return {
      _id: user._id,
      name: user.name,
      usn: user.usn,
      email: user.email,
      branch: user.branch,
      semester: user.semester,
      token: this.generateToken(user._id),
    };
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  }
}

module.exports = new UserService();