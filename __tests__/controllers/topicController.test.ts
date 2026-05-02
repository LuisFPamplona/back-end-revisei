import { prisma } from "../../src/lib/prisma";
import {
  createTopic,
  deleteTopic,
  getTopics,
  updateTopic,
} from "../../src/controllers/topicController";
import { syncGamification } from "../../src/services/gamificationService";
import { syncSubjectCompletion } from "../../src/services/subjectServices";

jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    topic: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    subject: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("../../src/services/gamificationService", () => ({
  syncGamification: jest.fn(),
}));
jest.mock("../../src/services/subjectServices", () => ({
  syncSubjectCompletion: jest.fn(),
}));

describe("topicController", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      user: {
        sub: {
          id: "user-id",
        },
      },
      params: {
        subjectId: "params-id",
        id: "params-id",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getTopics", () => {
    it("should return 200 and returns topics", async () => {
      (prisma.topic.findMany as jest.Mock).mockResolvedValue([
        {
          id: "topic-id",
          title: "topic-title",
          userId: "user-id",
        },
      ]);

      await getTopics(req, res);

      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        where: { subjectId: "params-id", subject: { userId: "user-id" } },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Topics found",
        }),
      );
    });

    it("should return 500 if an unexpected error occurs", async () => {
      (prisma.topic.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await getTopics(req, res);

      expect(prisma.topic.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error.",
        }),
      );
    });
  });

  describe("createTopic", () => {
    it("should return 201 and create the topic", async () => {
      req.body = {
        title: "topic-title",
      };

      (prisma.subject.findFirst as jest.Mock).mockResolvedValue({
        id: "subject-id",
        name: "subject-name",
      });

      (prisma.topic.create as jest.Mock).mockResolvedValue({
        id: "topic-id",
        title: "topic-title",
      });

      await createTopic(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", userId: "user-id" },
      });
      expect(prisma.topic.create).toHaveBeenCalledWith({
        data: {
          status: "pendente",
          subjectId: "params-id",
          title: "topic-title",
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Topic created successfully.",
        }),
      );
    });

    it("should return 404 if subject is not found", async () => {
      req.body = {
        title: "topic-title",
      };

      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(null);

      await createTopic(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", userId: "user-id" },
      });
      expect(prisma.topic.create).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Subject not found",
        }),
      );
    });

    it("should return 400 and not proceed when title is invalid", async () => {
      req.body = {
        title: "  ",
      };

      await createTopic(req, res);

      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.topic.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Title must be provided.",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      req.body = {
        title: "topic- title",
      };

      (prisma.subject.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await createTopic(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalled();
      expect(prisma.topic.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error.",
        }),
      );
    });
  });

  describe("updateTopic", () => {
    it("should return 200, call syncSubjectCompletion if status === concluido and update the topic", async () => {
      req.body = {
        title: "topic-title",
        status: "concluido",
        completedAt: "2026-05-02T00:46:00Z",
        seconds: "9999",
      };

      (prisma.topic.findFirst as jest.Mock).mockResolvedValue({
        id: "topic-id",
        title: "topic-title",
        subjectId: "subject-id",
      });

      (prisma.subject.findFirst as jest.Mock).mockResolvedValue({
        id: "subject-id",
        name: "subject-name",
      });

      (prisma.topic.update as jest.Mock).mockResolvedValue({
        id: "new-topic-id",
        title: "new-topic-title",
      });

      await updateTopic(req, res);

      expect(prisma.topic.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", subject: { userId: "user-id" } },
      });
      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "subject-id", userId: "user-id" },
      });
      expect(prisma.topic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "topic-id" },
        }),
      );

      expect(syncGamification).toHaveBeenCalled();
      expect(syncSubjectCompletion).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: "new-topic-id", title: "new-topic-title" },
          message: "Topic updated successfully.",
          success: true,
        }),
      );
    });

    it("should update the topic, not sync gamification, and sync subject completion when status is not concluido", async () => {
      req.body = {
        title: "topic-title",
        status: "pendente",
        seconds: "9999",
      };

      (prisma.topic.findFirst as jest.Mock).mockResolvedValue({
        id: "topic-id",
        title: "topic-title",
        subjectId: "subject-id",
        status: "concluido",
      });

      (prisma.subject.findFirst as jest.Mock).mockResolvedValue({
        id: "subject-id",
        name: "subject-name",
      });

      (prisma.topic.update as jest.Mock).mockResolvedValue({
        id: "new-topic-id",
        title: "new-topic-title",
      });

      await updateTopic(req, res);

      expect(prisma.topic.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", subject: { userId: "user-id" } },
      });

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "subject-id", userId: "user-id" },
      });

      expect(prisma.topic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "topic-id" },
        }),
      );
      expect(syncGamification).not.toHaveBeenCalled();
      expect(syncSubjectCompletion).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: "new-topic-id", title: "new-topic-title" },
          message: "Topic updated successfully.",
          success: true,
        }),
      );
    });

    it("should return 404 if topic is not found", async () => {
      req.body = {
        title: "topic-title",
        status: "concluido",
        completedAt: "2026-05-02T00:46:00Z",
        seconds: "9999",
      };

      (prisma.topic.findFirst as jest.Mock).mockResolvedValue(null);

      await updateTopic(req, res);

      expect(prisma.topic.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", subject: { userId: "user-id" } },
      });
      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.topic.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Topic not found.",
        }),
      );
    });

    it("should return 404 if subject is not found", async () => {
      req.body = {
        title: "topic-title",
        status: "concluido",
        completedAt: "2026-05-02T00:46:00Z",
        seconds: "9999",
      };

      (prisma.topic.findFirst as jest.Mock).mockResolvedValue({
        id: "topic-id",
        title: "topic-title",
        subjectId: "subject-id",
      });

      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(null);

      await updateTopic(req, res);

      expect(prisma.topic.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", subject: { userId: "user-id" } },
      });
      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "subject-id", userId: "user-id" },
      });
      expect(prisma.topic.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Subject not found.",
        }),
      );
    });

    it("should return 400 and not proceed when title, status and completedAt are not provided", async () => {
      req.body = {};

      await updateTopic(req, res);

      expect(prisma.topic.findFirst).not.toHaveBeenCalled();
      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.topic.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Title, status or completedAt must be provided.",
        }),
      );
    });

    it("should return 400 and not proceed when date format is invalid", async () => {
      req.body = {
        completedAt: "invalid-date",
      };

      await updateTopic(req, res);

      expect(prisma.topic.findFirst).not.toHaveBeenCalled();
      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.topic.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid format. Use ISO 8601.",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      req.body = {
        title: "topic-title",
        status: "concluido",
        completedAt: "2026-05-02T00:46:00Z",
        seconds: "9999",
      };

      (prisma.topic.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await updateTopic(req, res);

      expect(prisma.topic.findFirst).toHaveBeenCalled();
      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.topic.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error.",
        }),
      );
    });
  });

  describe("deleteTopic", () => {
    it("should return 404 if topic is not found", async () => {
      (prisma.topic.findFirst as jest.Mock).mockResolvedValue(null);

      await deleteTopic(req, res);

      expect(prisma.topic.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", subject: { userId: "user-id" } },
      });
      expect(prisma.topic.delete).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Topic not found.",
        }),
      );
    });

    it("should return 200 and delete the topic", async () => {
      (prisma.topic.findFirst as jest.Mock).mockResolvedValue({
        id: "topic-id",
        title: "topic-title",
        subjectId: "subject-id",
      });

      (prisma.topic.delete as jest.Mock).mockResolvedValue({
        id: "topic-id",
        title: "topic-title",
      });
      await deleteTopic(req, res);
      expect(prisma.topic.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", subject: { userId: "user-id" } },
      });
      expect(prisma.topic.delete).toHaveBeenCalledWith({
        where: { id: "params-id" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Topic deleted successfully.",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      (prisma.topic.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await deleteTopic(req, res);

      expect(prisma.topic.findFirst).toHaveBeenCalled();
      expect(prisma.topic.delete).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error.",
        }),
      );
    });
  });
});
