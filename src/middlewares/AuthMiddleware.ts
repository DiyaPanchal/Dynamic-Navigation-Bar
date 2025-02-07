import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";
import User, { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received Token:", token);
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("secret key is not defined in .env file");
    }
    const decodedToken = jwt.verify(token, secretKey) as { user_id: string };
    const user = await User.findById(decodedToken.user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
