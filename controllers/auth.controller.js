const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
        console.log("Received register:", req.body);

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exist!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "Register Successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Error server!", error });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email do not exist!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong Password!" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    res.json({ message: "Login Successfully!", token, user });
  } catch (error) {
    res.status(500).json({ message: "Error server!", error });
  }
};
