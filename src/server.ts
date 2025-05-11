import * as bodyParser from "body-parser";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { mongooseConnection } from "./database/db";
import { webhook } from "./controllers/order"; // Import webhook directly
import { authRouter } from "./routes/auth";
import { orderRouter } from "./routes/order";
import { getUniqueCountryMapping } from "./controllers/pincode";

mongooseConnection;
dotenv.config();
const app = express();
const port = process.env.PORT || 3033;

// Apply webhook BEFORE body parsers
app.post("/webhook", express.raw({ type: "application/json" }), webhook);

app.use(cors());
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Paypal working properly.");
});

app.use("/auth", authRouter);
app.use("/order", orderRouter);

// app.use("*", bad_gateway);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
