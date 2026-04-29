import {
  GamificationSource,
  syncGamificationTypes,
} from "../types/gamificationTypes";
import { prisma } from "../lib/prisma";
import { calculateGamification } from "../utils/calculateGamification";

export const syncGamification = async (
  action: syncGamificationTypes,
  id: string,
  source: GamificationSource,
  seconds: number,
) => {
  const rewards = calculateGamification(action, source, seconds);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      gems: {
        increment: rewards.gemReward,
      },
      experience: {
        increment: rewards.experienceReward,
      },
    },
    select: {
      id: true,
      gems: true,
      experience: true,
    },
  });

  return { rewards };
};
