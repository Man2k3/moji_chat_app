import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token is missing" });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.error("JWT verification error in auth middleware:", err);
        return res
          .status(403)
          .json({ message: "Invalid or expired access token" });
      }
      const user = await User.findById(decoded.userId).select(
        "-hashedPassword",
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error when checking JWT in auth middleware:", error);
    return res
      .status(500)
      .json({ message: "Error occurred while checking authentication" });
  }
};
