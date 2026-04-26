import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { syncSubjectCompletion } from "../services/subjectServices";
import { syncGems } from "../services/gamificationService";

export const getTopics = async (req: Request, res: Response) => {
  const userId = (req as any).user.sub.id;
  const { subjectId } = req.params;

  try {
    const data = await prisma.topic.findMany({
      where: { subjectId: subjectId as string, subject: { userId: userId } },
    });

    return res
      .status(200)
      .json({ success: true, message: "Topics found", data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  const userId = (req as any).user.sub.id;
  const { subjectId } = req.params;
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Title must be provided." });
  }

  try {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId as string, userId: userId },
    });

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    const data = await prisma.topic.create({
      data: {
        title: title,
        subjectId: subjectId as string,
        status: "pendente",
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "Topic created successfully.", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  const userId = (req as any).user.sub.id;
  const { id } = req.params;

  const { title, status, completedAt } = req.body;

  if (
    (title === undefined || title.trim() === "") &&
    status === undefined &&
    completedAt === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Title, status or completedAt must be provided.",
    });
  }

  if (completedAt) {
    const date = new Date(completedAt);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid format. Use ISO 8601." });
    }
  }
  try {
    const topic = await prisma.topic.findFirst({
      where: { id: id as string, subject: { userId: userId } },
    });

    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    }

    const data = await prisma.topic.update({
      where: { id: topic.id },
      data: {
        ...(title && { title: title }),
        ...(status !== undefined && { status: status }),
        ...(completedAt && { completedAt: completedAt }),
      },
    });

    if (status === "concluido") {
      syncGems("topicCompleted", userId);
    }

    await syncSubjectCompletion(topic.subjectId);

    return res
      .status(200)
      .json({ success: true, message: "Topic updated successfully.", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.sub.id;

  try {
    const topic = await prisma.topic.findFirst({
      where: { id: id as string, subject: { userId: userId } },
    });

    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    }

    const data = await prisma.topic.delete({ where: { id: id as string } });

    return res
      .status(200)
      .json({ success: true, message: "Topic deleted successfully.", data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
