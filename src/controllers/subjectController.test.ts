import { prisma } from "../lib/prisma";
import {
  createSubject,
  deleteSubject,
  getSpecificSubject,
  getSubjects,
  updateSubject,
} from "./subjectController";

jest.mock("../lib/prisma", () => ({
  prisma: {
    subject: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

let req: any;
let res: any;

describe("Subject Controller", () => {
  describe("getSubjects", () => {
    beforeEach(() => {
      req = {
        body: {},
        user: {
          sub: {
            id: "user-id",
          },
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.clearAllMocks();
    });

    it("should return 200 and subjects if data is valid", async () => {
      (prisma.subject.findMany as jest.Mock).mockResolvedValue([
        {
          id: "subject-id",
          name: "name",
          userId: "user-id",
        },
      ]);

      await getSubjects(req, res);

      expect(prisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-id" },
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Subjects found",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      (prisma.subject.findMany as jest.Mock).mockRejectedValue(
        new Error("Databas error"),
      );

      await getSubjects(req, res);

      expect(prisma.subject.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error",
        }),
      );
    });
  });

  describe("createSubject", () => {
    beforeEach(() => {
      req = {
        body: {},
        user: {
          sub: {
            id: "user-id",
          },
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.clearAllMocks();
    });

    it("should return 201 and create subject if data is valid", async () => {
      req.body = {
        name: "name",
        source: "explore",
      };

      (prisma.subject.create as jest.Mock).mockResolvedValue(
        expect.objectContaining({
          name: "name",
          source: "explore",
          id: "subject-id",
        }),
      );

      await createSubject(req, res);

      expect(prisma.subject.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            name: "name",
            source: "explore",
            userId: "user-id",
          },
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Subject created successfully",
        }),
      );
    });

    it("should return 400 and not proceed when name is invalid", async () => {
      req.body = {
        name: "  ",
        source: "explore",
      };

      await createSubject(req, res);

      expect(prisma.subject.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Name and source must be provided",
        }),
      );
    });

    it("should return 400 and not proceed when source is invalid", async () => {
      req.body = {
        name: "name",
        source: " ",
      };

      await createSubject(req, res);

      expect(prisma.subject.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Name and source must be provided",
        }),
      );
    });

    it("should return 400 and not proceed when source is invalid", async () => {
      req.body = {
        name: "name",
        source: "french-fries",
      };

      await createSubject(req, res);

      expect(prisma.subject.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Source provided is invalid.",
        }),
      );
    });

    it("should return 500 when a unknown error occurs", async () => {
      req.body = {
        name: "name",
        source: "user",
      };

      (prisma.subject.create as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await createSubject(req, res);

      expect(prisma.subject.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            name: "name",
            source: "user",
            userId: "user-id",
          },
        }),
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error",
        }),
      );
    });
  });

  describe("updateSubject", () => {
    beforeEach(() => {
      req = {
        body: {},
        user: {
          sub: {
            id: "user-id",
          },
        },
        params: {
          id: "params-id",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.clearAllMocks();
    });

    it("should return 200 and update the subject", async () => {
      req.body = {
        name: "name",
        source: "explore",
      };

      (prisma.subject.findFirst as jest.Mock).mockResolvedValue({
        id: "subject-id",
        name: "name",
        userId: "user-id",
      });

      (prisma.subject.update as jest.Mock).mockResolvedValue({
        id: "subject-id",
        name: "name",
        userId: "user-id",
      });

      await updateSubject(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", userId: "user-id" },
      });
      expect(prisma.subject.update).toHaveBeenCalledWith({
        where: { id: "params-id" },
        data: { name: "name", source: "explore" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Subject edited successfully",
        }),
      );
    });

    it("should return 400 and not proceed when id is not provided", async () => {
      req.body = {
        name: "name",
        source: "source",
      };

      req.params = {
        id: " ",
      };

      await updateSubject(req, res);

      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.subject.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Id must be provided",
        }),
      );
    });

    it("should return 400 and not proceed when name and source is invalid", async () => {
      req.body = {
        name: "  ",
        source: " ",
      };

      await updateSubject(req, res);

      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.subject.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Name or source must be provided",
        }),
      );
    });

    it("should return 400 and not proceed when subject is not found", async () => {
      req.body = {
        name: "name",
        source: "explore",
      };

      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(null);

      await updateSubject(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", userId: "user-id" },
      });
      expect(prisma.subject.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Subject not found",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      req.body = {
        name: "name",
        source: "explore",
      };

      (prisma.subject.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await updateSubject(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", userId: "user-id" },
      });
      expect(prisma.subject.update).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error",
        }),
      );
    });
  });

  describe("deleteSubject", () => {
    beforeEach(() => {
      req = {
        body: {},
        user: {
          sub: {
            id: "user-id",
          },
        },
        params: {
          id: "params-id",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.clearAllMocks();
    });

    it("should return 200 and delete the subject", async () => {
      (prisma.subject.findFirst as jest.Mock).mockResolvedValue({
        name: "name",
        id: "id",
      });

      (prisma.subject.delete as jest.Mock).mockResolvedValue({
        name: "name",
        id: "id",
      });

      await deleteSubject(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", userId: "user-id" },
      });
      expect(prisma.subject.delete).toHaveBeenCalledWith({
        where: { id: "params-id" },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Subject deleted successfully",
        }),
      );
    });

    it("should return 400 and not proceed when id is not valid", async () => {
      req.params = {
        id: "  ",
      };

      await deleteSubject(req, res);

      expect(prisma.subject.findFirst).not.toHaveBeenCalled();
      expect(prisma.subject.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Id must be provided",
        }),
      );
    });

    it("should return 404 and not proceed when subject is not found", async () => {
      (prisma.subject.findFirst as jest.Mock).mockResolvedValue(null);

      await deleteSubject(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "params-id", userId: "user-id" },
        }),
      );
      expect(prisma.subject.delete).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Subject not found",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      (prisma.subject.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await deleteSubject(req, res);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: "params-id", userId: "user-id" },
      });

      expect(prisma.subject.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error",
        }),
      );
    });
  });

  describe("getSpecificSubject", () => {
    beforeEach(() => {
      req = {
        body: {},
        user: {
          sub: {
            id: "user-id",
          },
        },
        params: {
          id: "params-id",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.clearAllMocks();
    });

    it("should return 200 and the subject data", async () => {
      (prisma.subject.findUnique as jest.Mock).mockResolvedValue({
        id: "id",
        name: "name",
      });

      await getSpecificSubject(req, res);

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({
        where: { id: "params-id" },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Subject found",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      (prisma.subject.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await getSpecificSubject(req, res);

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({
        where: { id: "params-id" },
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error",
        }),
      );
    });
  });
});
