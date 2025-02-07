import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: { role: string };
}

const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Access denied: Admins only" });
    return;
  }

  next();
};

export default adminMiddleware;
