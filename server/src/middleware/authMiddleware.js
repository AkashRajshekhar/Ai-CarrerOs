import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;
    const cookieToken = request.headers.cookie
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("careeros-token="))
      ?.slice("careeros-token=".length);
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";
    const token = bearerToken && !["null", "undefined"].includes(bearerToken)
      ? bearerToken
      : cookieToken
        ? decodeURIComponent(cookieToken)
        : "";

    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

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
