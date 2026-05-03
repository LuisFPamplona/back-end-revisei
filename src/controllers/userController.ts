import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { updateUserSchema } from "../schemas/user.schema";

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
        gems: true,
        experience: true,
      },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User found", data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const parsed = updateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0].message,
    });
  }

  const { name, email, password, currentPassword, dailyGoal } = parsed.data;

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
      dataToUpdate.name = name;
    }

    if (email !== undefined) {
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

    if (
      parsed.data.password !== undefined &&
      parsed.data.currentPassword !== undefined
    ) {
      const isCurrentPasswordValid = await bcrypt.compare(
        parsed.data.currentPassword,
        currentUser.password,
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      dataToUpdate.password = await bcrypt.hash(password as string, 10);
    }

    if (dailyGoal !== undefined) {
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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
