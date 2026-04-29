import { prisma } from "../lib/prisma";
import { syncGamification } from "./gamificationService";

jest.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

describe("syncGamification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update user gems and experience with calculated rewards", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: "user-id",
      gems: 1,
      experience: 5,
    });

    const result = await syncGamification(
      "topicCompleted",
      "user-id",
      "explore",
      600,
    );

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "user-id",
        },
        data: {
          gems: {
            increment: 1,
          },
          experience: {
            increment: 5,
          },
        },
      }),
    );
    expect(result).toEqual({
      rewards: {
        gemReward: 1,
        experienceReward: 5,
      },
    });
  });

  it("should update user with reduced rewards when source is user", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: "user-id",
      gems: 0,
      experience: 1,
    });

    const result = await syncGamification(
      "topicCompleted",
      "user-id",
      "user",
      600,
    );

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          gems: {
            increment: 0,
          },
          experience: {
            increment: 1,
          },
        },
      }),
    );

    expect(result).toEqual({
      rewards: {
        gemReward: 0,
        experienceReward: 1,
      },
    });
  });
});
