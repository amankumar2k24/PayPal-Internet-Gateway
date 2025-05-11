import { Request, Response } from "express";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userModel } from "../models/user";
import { response, serverError } from "../helpers/response";
dotenv.config();

export const signUp = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  try {
    const user = await userModel.create(body);
    if (!user) response(res, true, 400, "User not found", null);

    return response(res, false, 201, "User created successfully..", user);
  } catch (error) {
    serverError(res, error);
  }
};

export const signIn = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  try { 
    const user = await userModel.findOne({ email: body.email, isActive: true, isDelete: false });
    if (!user) return response(res, true, 400, "User not found", null);

    const isPasswordMatch = await compare(body.password, user.password);
    if (!isPasswordMatch) return response(res, true, 400, "Invalid password", null);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    if (!token) return response(res, true, 400, "Failed to generate token", null);
    
    return response(res, false, 200, "Login successful", { token });
  } catch (error) {
    serverError(res, error);
  }
};