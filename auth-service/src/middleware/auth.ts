import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

// load public key from file
const publicKey = fs.readFileSync(path.join(process.cwd(), '..', "public.pem"), "utf8");

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // Decode token to get userId (without verification yet)
    const decoded = jwt.decode(token) as {
      userId: number;
      isAdmin: boolean;
    } | null;
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Fetch user’s public key from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) return res.status(401).json({ message: "User not found" });

    // Verify token with user’s public key
    const verified = jwt.verify(token, publicKey) as {
      userId: number;
      isAdmin: boolean;
    };
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin)
    return res.status(403).json({ message: "Admin access required" });
  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; isAdmin: boolean };
    }
  }
}
