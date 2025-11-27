import { HttpStatusCode } from "axios";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { User } from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .json({ message: "No token provide" });
  }
  const token = authHeader.split(" ")[1]; // get actual token val
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User doesn't exist" });
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(HttpStatusCode.Unauthorized).json({ message: "Invalid token" });
  }
};
