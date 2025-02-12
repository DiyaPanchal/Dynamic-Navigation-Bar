import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";
import User from "../models/User";
import MenuItem from "../models/MenuItem";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
const secretKey = process.env.SECRET_KEY as string;
import { sendMenuUpdateNotification } from "../utils/notification";
interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const userLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
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

    if (!Array.isArray(accessibleMenus) || accessibleMenus.length === 0) {
      return res
        .status(400)
        .json({ message: "Accessible menus must be provided." });
    }
    const menuEntries = accessibleMenus.map(
      (menu: { menuId: string; expiryDate?: string }) => {
        if (!menu.menuId || typeof menu.menuId !== "string") {
          throw new Error("Invalid menuId provided!");
        }

        return {
          menuId: new mongoose.Types.ObjectId(menu.menuId),
          expiryDate: menu.expiryDate ? new Date(menu.expiryDate) : undefined,
        };
      }
    );

    const menuIds = menuEntries.map((menu) => menu.menuId);
    const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });

    if (!menuDocs.length) {
      return res.status(400).json({ message: "No valid menus found!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      accessibleMenus: menuEntries,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Error registering user.", error });
  }
};

export const userUpdate = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      role,
      accessibleMenus,
      menuAccessExpiry,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    let menusChanged = false;
    let oldMenuNames: string[] = [];
    let newMenuNames: string[] = [];

    if (accessibleMenus) {
      const menuObjectIds = accessibleMenus.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );

      const menuDocs = await MenuItem.find({ _id: { $in: menuObjectIds } });

      if (!menuDocs.length) {
        return res.status(400).json({ message: "No valid menus found!" });
      }

      const oldMenuDocs = await MenuItem.find({
        _id: { $in: user.accessibleMenus.map((m) => m.menuId) },
      });
      console.log("old menu:",oldMenuDocs);

      oldMenuNames = oldMenuDocs.map((menu) => menu.title);
      newMenuNames = menuDocs.map((menu) => menu.title);

      const updatedMenus = accessibleMenus.map(
        (menuId: string, index: number) => ({
          menuId: new mongoose.Types.ObjectId(menuId),
          expiryDate: menuAccessExpiry?.[index]
            ? new Date(menuAccessExpiry[index])
            : null,
        })
      );
      console.log("user access:",user.accessibleMenus);
      console.log("updates",updatedMenus);
      if (
        JSON.stringify(user.accessibleMenus) !== JSON.stringify(updatedMenus)
      ) {
        menusChanged = true;
      }

      user.accessibleMenus = updatedMenus;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
     logger.info(`Admin updated user: ${id}`, {
      adminId: req.user?.id || "Unknown",
      updatedUser: user.toJSON(),
    });

    if (menusChanged) {
      sendMenuUpdateNotification(user.email, oldMenuNames, newMenuNames);
    }

    return res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ message: "Error updating user.", error });
  }
};

export const userDelete = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    const adminId = req.user?.id || "Unknown";

    logger.warn({
      message: "User deleted",
      adminId,
      userId: deletedUser?._id?.toString() || "Unknown",
      action: "DELETE_USER",
      timestamp: new Date().toISOString(),
    });

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
