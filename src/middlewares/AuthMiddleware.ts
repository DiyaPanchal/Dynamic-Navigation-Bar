import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv/config";

const secretKey = process.env.SECRET_KEY as string;

interface AuthRequest extends Request {
  user?: { id: string; role: string; accessibleMenus?: any[] };
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, No Token!" });
    }

    const decoded = jwt.verify(token, secretKey) as {
      user_id: string;
      role: string;
    };

    const user = await User.findById(decoded.user_id).populate(
      "accessibleMenus"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found!" });
    }

    req.user = {
      id: (user._id as string).toString(),
      role: user.role,
      accessibleMenus: user.accessibleMenus || [], 
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token!" });
  }
};

export default authMiddleware;
