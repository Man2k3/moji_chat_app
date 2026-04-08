import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendRequests,
} from "../controllers/friendController.js";

const router = express.Router();

// Route to send a friend request
router.post("/requests", sendFriendRequest);
// Route to accept a friend request
router.post("/requests/:requestId/accept", acceptFriendRequest);
// Route to decline a friend request
router.post("/requests/:requestId/decline", declineFriendRequest);
// Route to get all friends
router.get("/", getAllFriends);
// Route to get all friend requests
router.get("/requests", getFriendRequests);

export default router;
