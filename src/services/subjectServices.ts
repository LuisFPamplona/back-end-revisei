import { prisma } from "../lib/prisma";
import { syncGems } from "./gamificationService";

export const syncSubjectCompletion = async (subjectId: string) => {
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

  if (isCompleted) syncGems("subjectCompleted", userId.userId);
};
