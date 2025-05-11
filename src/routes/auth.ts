import { Router } from "express";
const authRouter = Router();

import { signIn, signUp } from "../controllers/auth";

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);

export { authRouter };