import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    specialization: user.specialization || "",
    bio: user.bio || ""
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function register(req, res) {
  const {
    name,
    email,
    password,
    role = "user",
    specialization = "",
    bio = ""
  } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  if (!["user", "provider"].includes(role)) {
    return res.status(400).json({ message: "Invalid account type" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  if (role === "provider" && !specialization.trim()) {
    return res.status(400).json({
      message: "Specialization is required for providers"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    specialization: role === "provider" ? specialization.trim() : "",
    bio: role === "provider" ? bio.trim() : ""
  });

  res.status(201).json({
    token: signToken(user),
    user: publicUser(user)
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: signToken(user),
    user: publicUser(user)
  });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  const { name, email, specialization = "", bio = "" } = req.body;

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  if (req.user.role === "provider" && !specialization.trim()) {
    return res.status(400).json({
      message: "Specialization is required for providers"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: req.user._id }
  });

  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const update = {
    name: name.trim(),
    email: normalizedEmail
  };

  if (req.user.role === "provider") {
    update.specialization = specialization.trim();
    update.bio = bio.trim();
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    update,
    {
      new: true,
      runValidators: true
    }
  ).select("-password");

  res.json({ user: publicUser(user) });
}

export async function listProviders(req, res) {
  const providers = await User.find({ role: "provider" })
    .select("name email specialization bio")
    .sort({ name: 1 });

  res.json({ providers });
}
