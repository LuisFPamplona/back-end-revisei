import { prisma } from "../lib/prisma";
import { GamificationSource } from "../types/gamificationTypes";
import { syncGamification } from "./gamificationService";

export const syncSubjectCompletion = async (
  subjectId: string,
  seconds: number,
) => {
  const userId = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { userId: true },
  });

  if (!userId) {
    throw new Error("Error at find userId.");
  }

  const totalTopics = await prisma.topic.count({
    where: { subjectId },
  });

  const completedTopics = await prisma.topic.count({
    where: {
      subjectId,
      status: "concluido",
    },
  });

  const isCompleted = totalTopics > 0 && totalTopics === completedTopics;

  await prisma.subject.update({
    where: { id: subjectId },
    data: { isCompleted },
  });

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId: userId.userId },
  });

  if (!subject) {
    throw new Error("Error at find subject.");
  }

  if (isCompleted) {
    syncGamification(
      "subjectCompleted",
      userId.userId,
      subject.source as GamificationSource,
      seconds,
    );
  }
};
