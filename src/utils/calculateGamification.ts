import {
  GamificationSource,
  syncGamificationTypes,
} from "../types/gamificationTypes";

const gemsRewards: Record<syncGamificationTypes, number> = {
  topicCompleted: 1,
  subjectCompleted: 3,
};

const experienceRewards: Record<syncGamificationTypes, number> = {
  topicCompleted: 5,
  subjectCompleted: 20,
};

export const calculateGamification = (
  action: syncGamificationTypes,
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

  return { gemReward, experienceReward };
};
