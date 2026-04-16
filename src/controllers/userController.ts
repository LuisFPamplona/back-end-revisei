import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getUser = async (req: Request, res: Response) => {
  const userId = (req as any).user.sub.id;
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
