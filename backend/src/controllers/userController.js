import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";
export const authMe = async (req, res) => {
  try {
    const user = req.user; // Assuming the user is attached to the request object by authentication middleware
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error during authMe:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const test = async (req, res) => {
  return res.sendStatus(204);
};

export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await User.findOne({ username }).select(
      "_id displayName username avatarUrl",
    );

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error during searchUserByUsername:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user._id;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await uploadImageFromBuffer(file.buffer);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        new: true,
      },
    ).select("avatarUrl");
    if (!updatedUser.avatarUrl) {
      return res.status(404).json({ message: "Avatar trả về null" });
    }
    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Error during uploadAvatar:", error);
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};
