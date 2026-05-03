import { prisma } from "../../src/lib/prisma";
import { getUser, updateUser } from "../../src/controllers/userController";
import bcrypt from "bcrypt";

jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("userController", () => {
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
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getUser", () => {
    it("should return 200 and user data when user is found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        name: "Luis",
        email: "luis@example.com",
      });

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User found",
        data: {
          name: "Luis",
          email: "luis@example.com",
        },
      });
    });

    it("should return 404 when user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should return 500 on database error", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error.",
      });
    });
  });

  describe("updateUser", () => {
    it("should return 200 and updated user data when update is successful", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
        password: "newpassword123",
        currentPassword: "currentpassword123",
        dailyGoal: 5,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        password: "hashed-password",
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        name: "New Name",
        email: "newemail@example.com",
        dailyGoal: 5,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-newpassword");

      await updateUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "currentpassword123",
        "hashed-password",
      );
      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", 10);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-id" },
          data: {
            name: "New Name",
            email: "newemail@example.com",
            password: "hashed-newpassword",
            dailyGoal: 5,
          },
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User updated successfully.",
          data: {
            name: "New Name",
            email: "newemail@example.com",
            dailyGoal: 5,
          },
        }),
      );
    });

    it("should return 404 when user is not found", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User not found.",
        }),
      );
    });

    it("should return 400 when name is invalid", async () => {
      req.body = {
        name: "  ",
        email: "newemail@example.com",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Name cannot be empty.",
        }),
      );
    });

    it("should return 400 when email is invalid", async () => {
      req.body = {
        name: "New Name",
        email: "  ",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email cannot be empty.",
        }),
      );
    });

    it("should return 409 when email is already in use", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: "user-id" })
        .mockResolvedValueOnce({ id: "existing-user-id" });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email already in use.",
        }),
      );
    });

    it("should return 400 and not proceed when password is invalid", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
        password: "  ",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Password cannot be empty.",
        }),
      );
    });

    it("should return 400 and not proceed when current password is invalid", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
        password: "newpassword123",
        currentPassword: "  ",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        password: "hashed-current-password",
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Current password is required to update the password.",
        }),
      );
    });

    it("should return 401 and not proceed when current password is incorrect", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
        password: "newpassword123",
        currentPassword: "incorrectpassword",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        password: "hashed-current-password",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await updateUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "incorrectpassword",
        "hashed-current-password",
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Current password is incorrect.",
        }),
      );
    });

    it("should return 400 and not proceed when daily goal is invalid", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
        dailyGoal: -1,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Daily goal must be an integer greater than 0.",
        }),
      );
    });

    it("should return 400 and not proceed when no field is provided for update", async () => {
      req.body = {};

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Provide at least one field to update.",
        }),
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      req.body = {
        name: "New Name",
        email: "newemail@example.com",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
      });

      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await updateUser(req, res);

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
