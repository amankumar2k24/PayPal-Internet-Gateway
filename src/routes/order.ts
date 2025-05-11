import express, { Router } from "express";
const orderRouter = Router();

import { verifyJwt } from "../helpers/verifyJWT";
import { captureOrder, createOrder, webhook } from "../controllers/order";
import { getUniqueCountryMapping } from "../controllers/pincode";

orderRouter.post("/create-order", createOrder);
orderRouter.post("/capture-order", captureOrder);
orderRouter.post("/", getUniqueCountryMapping);

export { orderRouter };
