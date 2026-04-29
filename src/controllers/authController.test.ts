import { login, register } from "./authController";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("register controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should create user when data is valid", async () => {
    req.body = {
      name: "Luis",
      email: "luis@email.com",
      password: "123456",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    await register(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
    expect(prisma.user.create).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it("should return 400 and not proceed when name is invalid", async () => {
    req.body = {
      name: "",
      email: "teste@email.com",
      password: "123456",
    };

    await register(req, res);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Name is required.",
      }),
    );
  });

  it("should return 400 and not proceed when email is invalid", async () => {
    req.body = {
      name: "name",
      email: "  ",
      password: "superpassword",
    };

    await register(req, res);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Email is required.",
      }),
    );
  });

  it("should return 400 and not proceed when password is invalid", async () => {
    req.body = {
      name: "name",
      email: "test@email.com",
      password: "   ",
    };

    await register(req, res);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Password is required.",
      }),
    );
  });

  it("should return 400 and not proceed when email already exists", async () => {
    req.body = {
      name: "name",
      email: "test@email.com",
      password: "hyperpassword",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "test@email.com",
    });

    await register(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@email.com" },
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Email already in use.",
      }),
    );
  });

  it("should return 500 when an unexpected error occurs", async () => {
    req.body = {
      name: "name",
      email: "test@email.com",
      password: "123456",
    };

    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Internal server error",
      }),
    );
  });
});

describe("login controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should return 200 and give a jwt token if data is valid", async () => {
    req.body = {
      email: "test@email.com",
      password: "123456",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      email: "test@email.com",
      password: "hashPassword",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("fake-token");

    await login(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@email.com" },
      }),
    );

    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashPassword");
    expect(jwt.sign).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Login successful.",
        data: { token: "fake-token" },
      }),
    );
  });

  it("should return 400 and not proceed when email is invalid", async () => {
    req.body = {
      email: "  ",
      password: "123456",
    };

    await login(req, res);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Email is required.",
      }),
    );
  });

  it("should return 400 and not proceed when password is invalid", async () => {
    req.body = {
      email: "test@email.com",
      password: "  ",
    };

    await login(req, res);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Password is required.",
      }),
    );
  });

  it("should return 404 and not proceed when user was not found", async () => {
    req.body = {
      email: "test@email.com",
      password: "123456",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await login(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@email.com" },
      }),
    );
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Account not found.",
      }),
    );
  });

  it("should return 401 and not proceed when credentials are invalid", async () => {
    req.body = {
      email: "test@email.com",
      password: "123456",
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      email: "test@email.com",
      password: "hashPassword",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await login(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "test@email.com" } }),
    );
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashPassword");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwt.sign).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid credentials.",
      }),
    );
  });

  it("should return 500 when an unexpected error occurs", async () => {
    req.body = {
      email: "test@email.com",
      password: "123456",
    };

    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Internal server error.",
      }),
    );
  });
});
