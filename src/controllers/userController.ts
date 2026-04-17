import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const getAuthenticatedUserId = (req: Request) => {
  return (req as any).user.sub.id as string;
};

export const getUser = async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  try {
    const data = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        dailyGoal: true,
        _count: { select: { subjects: true } },
      },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot get user data" });
    }
    console.log(data);
    return res.status(200).json({ success: true, message: "User found", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const { name, email, password, currentPassword, dailyGoal } = req.body;

  try {
    const dataToUpdate: {
      name?: string;
      email?: string;
      password?: string;
      dailyGoal?: number;
    } = {};

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: "Name cannot be empty." });
      }

      dataToUpdate.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || email.trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: "Email cannot be empty." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser && existingUser.id !== userId) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use." });
      }

      dataToUpdate.email = normalizedEmail;
    }

    if (password !== undefined) {
      if (typeof password !== "string" || password.trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: "Password cannot be empty." });
      }

      if (
        typeof currentPassword !== "string" ||
        currentPassword.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to update the password.",
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password,
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    if (dailyGoal !== undefined) {
      if (
        typeof dailyGoal !== "number" ||
        !Number.isInteger(dailyGoal) ||
        dailyGoal < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Daily goal must be an integer greater than 0.",
        });
      }

      dataToUpdate.dailyGoal = dailyGoal;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        name: true,
        email: true,
        dailyGoal: true,
        _count: { select: { subjects: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
