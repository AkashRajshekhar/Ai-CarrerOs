import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (request, response) => {
  try {
    const name = request.body.name?.trim();
    const email = request.body.email?.trim().toLowerCase();
    const { password, confirmPassword } = request.body;

    if (!name || !email || !password || !confirmPassword) {
      return response.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return response.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return response.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Server error during signup",
      error: error.message,
    });
  }
};

export const login = async (request, response) => {
  try {
    const { email, password } = request.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return response.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return response.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (request, response) => {
  try {
    return response.status(200).json({
      success: true,
      user: request.user,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Unable to fetch user details",
      error: error.message,
    });
  }
};

export const logout = (request, response) => {
  return response.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const updateAccount = async (request, response) => {
  try {
    const name = request.body.name?.trim();
    const email = request.body.email?.trim().toLowerCase();
    if (!name || !email) {
      return response
        .status(400)
        .json({ success: false, message: "Name and email are required." });
    }

    const emailOwner = await User.findOne({
      email,
      _id: { $ne: request.user._id },
    });
    if (emailOwner) {
      return response
        .status(409)
        .json({ success: false, message: "That email is already in use." });
    }

    const user = await User.findByIdAndUpdate(
      request.user._id,
      { $set: { name, email } },
      { new: true, runValidators: true },
    ).select("-password");

    return response.status(200).json({ success: true, user });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to update account." });
  }
};

export const changePassword = async (request, response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = request.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return response
        .status(400)
        .json({ success: false, message: "All password fields are required." });
    }
    if (newPassword.length < 6) {
      return response
        .status(400)
        .json({
          success: false,
          message: "New password must be at least 6 characters long.",
        });
    }
    if (newPassword !== confirmPassword) {
      return response
        .status(400)
        .json({ success: false, message: "New passwords do not match." });
    }

    const user = await User.findById(request.user._id);
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return response
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await user.save();
    return response
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to change password." });
  }
};

export const deleteAccount = async (request, response) => {
  try {
    await User.findByIdAndDelete(request.user._id);
    return response
      .status(200)
      .json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "Unable to delete account." });
  }
};
