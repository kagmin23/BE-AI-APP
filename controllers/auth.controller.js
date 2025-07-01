const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// Gửi OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email not found!" });

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Gán OTP và thời gian hết hạn
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    // Gửi email OTP
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "phankangmin@gmail.com",
        pass: "ucza mylz qftj hdlt", // App Password
      },
    });

    const mailOptions = {
      to: user.email,
      subject: "Your OTP Code",
      html: `
        <p>Your OTP code to reset password is:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to email!" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error!" });
  }
};

// Reset password bằng OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error!" });
  }
};