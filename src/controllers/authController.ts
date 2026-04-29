import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    if (!email || email.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    if (!password || password.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Password is required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use." });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashPassword,
      },
    });

    return res.status(201).json({ success: true, message: "Account created." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const jwt_secret = process.env.JWT_SECRET;

    if (!email || email.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    if (!password || password.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Password is required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { _count: { select: { subjects: true } } },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign({ sub: user }, jwt_secret!, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .json({ success: true, message: "Login successful.", data: { token } });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
