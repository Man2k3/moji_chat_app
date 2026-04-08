import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;

    if (to === from.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    const userExist = await User.exists({ _id: to });
    console.log("User exist:", userExist);
    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }
    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }

    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    if (alreadyFriends) {
      return res.status(400).json({ message: "You are already friends" });
    }
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }
    const request = await FriendRequest.create({ from, to, message });
    res.status(201).json({ message: "Friend request sent", request });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Error sending friend request" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to accept this friend request",
      });
    }
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });
    await FriendRequest.findByIdAndDelete(requestId);
    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean();

    res.status(200).json({
      message: "Friend request accepted",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Error accepting friend request" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to decline this friend request",
      });
    }
    await FriendRequest.findByIdAndDelete(requestId);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error declining friend request:", error);
    res.status(500).json({ message: "Error declining friend request" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendship = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "_id displayName avatarUrl")
      .populate("userB", "_id displayName avatarUrl")
      .lean();
    if (!friendship.length) {
      return res.status(200).json({ friends: [] });
    }
    const friends = friendship.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
    );
    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Error fetching all friends:", error);
    res.status(500).json({ message: "Error fetching all friends" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const populateFields = "_id username displayName avatarUrl";
    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId })
        .populate("to", populateFields)
        .lean(),
      FriendRequest.find({ to: userId })
        .populate("from", populateFields)
        .lean(),
    ]);
    res.status(200).json({ sent, received });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Error fetching friend requests" });
  }
};
