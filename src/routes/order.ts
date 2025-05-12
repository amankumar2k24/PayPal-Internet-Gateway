import express, { Router } from "express";
const orderRouter = Router();

import { verifyJwt } from "../helpers/verifyJWT";
import { captureOrder, createOrder, generateAccessToken, webhook } from "../controllers/order";
import { getUniqueCountryMapping } from "../controllers/pincode";

orderRouter.post("/generateAccessToken", generateAccessToken);
orderRouter.post("/create-order", verifyJwt, createOrder);
orderRouter.post("/capture-order", verifyJwt, captureOrder);
orderRouter.post("/", getUniqueCountryMapping);

export { orderRouter };
