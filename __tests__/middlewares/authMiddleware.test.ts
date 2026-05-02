import { authMiddleware } from "../../src/middlewares/authMiddleware";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("authMiddleware", () => {
  let req: any;
  let res: any;
  const next = jest.fn();

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer validtoken",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should call next() if token is valid", () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: "123" });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validtoken",
      process.env.JWT_SECRET,
    );
    expect(req.user).toEqual({ userId: "123" });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if token is missing", () => {
    req.headers.authorization = undefined;

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid token.",
      }),
    );
  });

  it("should return 401 if token format is invalid", () => {
    req.headers.authorization = "Bearer invalidtoken format";

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid token",
      }),
    );
  });

  it("should return 401 if token is invalid or expired", () => {
    req.headers.authorization = "Bearer invalidtoken";

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid or expired token",
      }),
    );
  });
});
