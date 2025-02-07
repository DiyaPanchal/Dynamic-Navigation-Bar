import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";
import User from "../models/User";
import MenuItem from "../models/MenuItem";

const secretKey = process.env.SECRET_KEY as string;

export const userLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const {email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Access Denied, Invalid Password!" });
    }

    const token = jwt.sign({ user_id: user._id, role: user.role }, secretKey, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Internal Server Error", err });
  }
};

export const userRegister = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { username, email, password, role, accessibleMenus} = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }
    let userAccessibleMenus: string[] = accessibleMenus || [];
    if (role === "admin") {
      const allMenus = await MenuItem.find();
      userAccessibleMenus = allMenus.map((menu) => menu.id.toString());
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      accessibleMenus: userAccessibleMenus,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Error registering user.", error });
  }
};

export const userDelete = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; 
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Error deleting user.", error });
  }
};
