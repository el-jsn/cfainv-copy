import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET;


// Login Controller
export const loginUser = async (req, res) => {
  const { username, pin } = req.body;

  // Validate request payload
  if (!username || !pin) {
    return res.status(400).json({ message: "Username and PIN are required." });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if PIN matches (compare hashed PIN)
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid PIN." });
    }

    const token = jwt.sign({ id: user._id, username: user.username , isAdmin: user.isAdmin}, JWT_SECRET, {
      expiresIn: "30d", 
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'Lax', // Or 'Strict' depending on your needs
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    });

    return res.status(200).json({ 
      message: "Login successful.",
      token
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Register Controller
export const registerUser = async (req, res) => {
  const { username, pin } = req.body;

  // Validate request payload
  if (!username || !pin) {
    return res.status(400).json({ message: "Username and PIN are required." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash the PIN before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    // Create new user
    const newUser = new User({ username, pin: hashedPin });
    await newUser.save();

    return res.status(201).json({ message: "User created successfully.", user: newUser.username });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


