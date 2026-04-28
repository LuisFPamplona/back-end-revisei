import {
  GamificationSource,
  syncGamificationTypes,
} from "../types/gamificationTypes";
import { prisma } from "../lib/prisma";

const gemsRewards: Record<syncGamificationTypes, number> = {
  topicCompleted: 1,
  subjectCompleted: 3,
};

const experienceRewards: Record<syncGamificationTypes, number> = {
  topicCompleted: 5,
  subjectCompleted: 20,
};

export const syncGamification = async (
  action: syncGamificationTypes,
  id: string,
  source: GamificationSource,
  seconds: number,
) => {
  let gemReward = gemsRewards[action];
  let experienceReward = experienceRewards[action];

  if (
    gemReward === undefined ||
    experienceReward === undefined ||
    source === undefined
  ) {
    throw new Error("Invalid gamification action.");
  }

  if (source == "user" || seconds < 600) {
    experienceReward = experienceReward * 0.2;
    gemReward = 0;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      gems: {
        increment: gemReward,
      },
      experience: {
        increment: experienceReward,
      },
    },
    select: {
      id: true,
      gems: true,
      experience: true,
    },
  });

  return { gemReward, experienceReward };
};
