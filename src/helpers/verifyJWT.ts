import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user";
import { response, serverError } from "./response";

export const verifyJwt = async (req: Request, res: Response, next: any): Promise<any> => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return response(res, true, 400, "Token is missing", null);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    if (!decodedToken) return response(res, true, 400, "Invalid token", null);

    const user = await userModel.findOne({ _id: decodedToken.id });
    if (!user) return response(res, true, 400, "User not found", null);

    req.headers.user = user;
    next();
  } catch (error) {
    serverError(res, error);
  }
};