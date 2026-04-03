import express from "express";
import dotevn from "dotenv";
import { connectDB } from "./libs/db.js";

dotevn.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
