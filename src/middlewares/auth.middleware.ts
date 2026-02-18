import { NextFunction, Request, Response } from "express";
import { getUserData } from "../utils/jwt";
import { IReqUser } from "../utils/interface";

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(404).json({
      message: "Unauthorized",
      data: null,
    });
  }

  const [prefix, token] = authorization.split(" ");

  if (!(prefix === "Bearer" && token)) {
    return res.status(403).json({
      message: "Unauthorized",
      data: null,
    });
  }

  try {
    const user = getUserData(token);

    if (!user) {
      return res.status(403).json({
        message: "Unauthorized",
        data: null,
      });
    }

    (req as IReqUser).user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Unauthorized",
      data: null,
    });
  }
};