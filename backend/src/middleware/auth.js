import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function providerOnly(req, res, next) {
  if (req.user?.role !== "provider") {
    return res.status(403).json({ message: "Provider access required" });
  }

  next();
}

export function userOnly(req, res, next) {
  if (req.user?.role !== "user") {
    return res.status(403).json({ message: "User access required" });
  }

  next();
}
