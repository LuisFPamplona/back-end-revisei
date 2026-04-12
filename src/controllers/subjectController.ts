import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getSubjects = async (req: Request, res: Response) => {
  const userId = (req as any).user.sub;

  try {
    const data = await prisma.subject.findMany({
      where: { userId: userId as string },
    });

    return res
      .status(200)
      .json({ success: true, message: "Subjects found", data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Name must be provided" });
  }
  try {
    const data = await prisma.subject.create({
      data: { name: name, userId: userId as string },
    });

    return res
      .status(201)
      .json({ success: true, message: "Subject created successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Id must be provided" });
  }

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Name must be provided" });
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: { id: id as string, userId: (req as any).user.sub },
    });

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    const data = await prisma.subject.update({
      where: { id: id as string },
      data: { name: name },
    });

    return res
      .status(200)
      .json({ success: true, message: "Subject edited successfully", data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Id must be provided" });
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: { id: id as string, userId: (req as any).user.sub },
    });

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    const data = await prisma.subject.delete({ where: { id: id as string } });
    return res
      .status(200)
      .json({ success: true, message: "Subject deleted successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
