import * as bodyParser from "body-parser";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { mongooseConnection } from "./database/db";
import { webhook } from "./controllers/order"; // Import webhook directly
import { authRouter } from "./routes/auth";
import { orderRouter } from "./routes/order";
import { getUniqueCountryMapping } from "./controllers/pincode";
import axios from "axios";
import { capturePayment, createOrder } from "./controllers/paypal";

mongooseConnection;
dotenv.config();
const app = express();
const port = process.env.PORT || 3033;


// Apply webhook BEFORE body parsers
app.post("/webhook", express.raw({ type: "application/json" }), webhook);

app.use(cors());
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

app.set('view engine', 'ejs')
app.set('views', './src/views');

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/pay', async (req, res) => {
  try {
    const url = await createOrder()
    console.log("url", url)

    res.redirect(url)
  } catch (error) {
    res.send('Error: ' + error)
  }
})

app.get('/complete-order', async (req, res) => {
  try {
    await capturePayment(req.query.token)

    res.send('Course purchased successfully')
  } catch (error) {
    res.send('Error: ' + error)
  }
})

app.get('/cancel-order', (req, res) => {
  res.redirect('/')
})


// app.get("/", (req: Request, res: Response) => {
//   res.send("Paypal working properly.");
// });

app.use("/auth", authRouter);
app.use("/order", orderRouter);

// app.use("*", bad_gateway);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});


