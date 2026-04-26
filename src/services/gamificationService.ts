import { syncGemsActions } from "../types/gamificationTypes";
import { prisma } from "../lib/prisma";

const rewards = {
  topicCompleted: 1,
  subjectCompleted: 3,
};

export const syncGems = async (action: syncGemsActions, id: string) => {
  const reward = rewards[action];

  if (!reward) {
    throw new Error("Invalid gamification action.");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      gems: {
        increment: reward,
      },
    },
    select: {
      id: true,
      gems: true,
    },
  });

  return updatedUser;
};
