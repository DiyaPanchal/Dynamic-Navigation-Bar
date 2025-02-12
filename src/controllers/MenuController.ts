import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
import MenuItem from "../models/MenuItem";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const addMenuItem = async (req: AuthRequest, res: Response): Promise<any> => {
  const { title, parent, priority } = req.body;
  const newItem = new MenuItem({ title, parent, priority });
  await newItem.save();
  res.status(201).json(newItem);
};


const getParentItems = async (menuItemIds: string[]) => {
  const allMenuItems = new Set(menuItemIds);

  const findParents = async (ids: string[]) => {
    if (ids.length === 0) return;

    const parents = await MenuItem.find({ _id: { $in: ids } }, "parent");

    const parentIds: string[] = parents
      .map((item) => item.parent?.toString())
      .filter((parent): parent is string => Boolean(parent));
    parentIds.forEach((id) => allMenuItems.add(id));

    await findParents(parentIds); 
  };


  await findParents(menuItemIds);
  return Array.from(allMenuItems);
};

export const getMenuForUser = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    let menuItems;
    if (user.role === "admin") {
      menuItems = await MenuItem.find().sort({ priority: 1 });
    } else {
      const currentDate = new Date();

      const validMenuIds = user.accessibleMenus
        .filter(
          (menu) => !menu.expiryDate || new Date(menu.expiryDate) > currentDate
        )
        .map((menu) => menu.menuId);

      if (validMenuIds.length === 0) {
        return res.json([]);
      }

      const accessibleMenuIds = await getParentItems(validMenuIds);
      menuItems = await MenuItem.find({ _id: { $in: accessibleMenuIds } }).sort(
        { priority: 1 }
      );
    }

    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getAllMenus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const menus = await MenuItem.find({}, "_id title");
    res.json({menus});
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
