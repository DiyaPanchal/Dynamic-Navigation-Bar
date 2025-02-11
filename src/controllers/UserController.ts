import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";
import User from "../models/User";
import MenuItem from "../models/MenuItem";
import mongoose from "mongoose";

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
    const { username, email, password, role, accessibleMenus } = req.body;
    const menuObjectIds = accessibleMenus.map(
      (id: string) => new mongoose.Types.ObjectId(id)
    );
    const menuDocs = await MenuItem.find({ _id: { $in: menuObjectIds } });
    if (!menuDocs.length) {
      return res.status(400).json({ message: "No valid menus found!" });
    }
    const menuIds = menuDocs.map((menu) => (menu._id).toString());

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      accessibleMenus: menuIds,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Error registering user.", error });
  }
};
export const userUpdate = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { username, email, password, role, accessibleMenus } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    if (accessibleMenus) {
      const menuObjectIds = accessibleMenus.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
      const menuDocs = await MenuItem.find({ _id: { $in: menuObjectIds } });
      if (!menuDocs.length) {
        return res.status(400).json({ message: "No valid menus found!" });
      }
      user.accessibleMenus = menuDocs.map((menu) => menu._id.toString());
    }

    await user.save();
    return res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ message: "Error updating user.", error });
  }
};

export const userDelete = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Error deleting user.", error });
  }
};

// export const searchUser = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { email } = req.query;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
