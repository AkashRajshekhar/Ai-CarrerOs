import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token || token.split(".").length !== 3) {
      return response.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    request.user = user;
    next();
  } catch (error) {
    return response.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};
