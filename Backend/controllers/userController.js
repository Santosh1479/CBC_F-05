const UserService = require("../services/User.service");

const registerUser = async (req, res) => {
  const { name, usn, email, password, branch, semester } = req.body;

  if (!name || !usn || !email || !password || !branch || !semester) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const userData = await UserService.register(req.body);
    res.status(201).json(userData);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await UserService.login(email, password);
    res.json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };