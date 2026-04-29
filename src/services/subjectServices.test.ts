import { prisma } from "../lib/prisma";
import { syncSubjectCompletion } from "./subjectServices";
import { syncGamification } from "./gamificationService";

jest.mock("../lib/prisma", () => ({
  prisma: {
    subject: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    topic: {
      count: jest.fn(),
    },
  },
}));

jest.mock("./gamificationService", () => ({
  syncGamification: jest.fn(),
}));

describe("syncSubjectCompletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should mark subject as completed and sync gamification when all topics are completed", async () => {
    (prisma.subject.findUnique as jest.Mock).mockResolvedValue({
      userId: "user-id",
    });

    (prisma.topic.count as jest.Mock)
      .mockResolvedValueOnce(2) // totalTopics
      .mockResolvedValueOnce(2); // completedTopics

    (prisma.subject.update as jest.Mock).mockResolvedValue({});

    (prisma.subject.findFirst as jest.Mock).mockResolvedValue({
      id: "subject-id",
      userId: "user-id",
      source: "explore",
    });

    await syncSubjectCompletion("subject-id", 600);

    expect(prisma.subject.update).toHaveBeenCalledWith({
      where: { id: "subject-id" },
      data: { isCompleted: true },
    });

    expect(syncGamification).toHaveBeenCalledWith(
      "subjectCompleted",
      "user-id",
      "explore",
      600,
    );
  });

  it("should mark subject as not completed and not sync gamification when not all topics are completed", async () => {
    (prisma.subject.findUnique as jest.Mock).mockResolvedValue({
      userId: "user-id",
    });

    (prisma.topic.count as jest.Mock)
      .mockResolvedValueOnce(3) // totalTopics
      .mockResolvedValueOnce(2); // completedTopics

    (prisma.subject.update as jest.Mock).mockResolvedValue({});

    (prisma.subject.findFirst as jest.Mock).mockResolvedValue({
      id: "subject-id",
      userId: "user-id",
      source: "explore",
    });

    await syncSubjectCompletion("subject-id", 600);

    expect(prisma.subject.update).toHaveBeenCalledWith({
      where: { id: "subject-id" },
      data: { isCompleted: false },
    });

    expect(syncGamification).not.toHaveBeenCalled();
  });

  it("should throw an error when userId is not found", async () => {
    (prisma.subject.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(syncSubjectCompletion("subject-id", 600)).rejects.toThrow(
      "Error at find userId.",
    );

    expect(prisma.subject.update).not.toHaveBeenCalled();
    expect(syncGamification).not.toHaveBeenCalled();
  });

  it("should throw an error when subject is not found after update", async () => {
    (prisma.subject.findUnique as jest.Mock).mockResolvedValue({
      userId: "user-id",
    });

    (prisma.topic.count as jest.Mock)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2);

    (prisma.subject.update as jest.Mock).mockResolvedValue({});

    (prisma.subject.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(syncSubjectCompletion("subject-id", 600)).rejects.toThrow(
      "Error at find subject.",
    );

    expect(syncGamification).not.toHaveBeenCalled();
  });
});
