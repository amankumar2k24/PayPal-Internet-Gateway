import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
import { response, serverError } from "../helpers/response";
import { orderModel } from "../models/order";
import axios from "axios";

async function generateAccessToken() {
  const response = await axios({
    url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    method: 'POST',
    data: 'grant_type=client_credentials',
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET
    }
  })

  return response.data.access_token
}

export const createOrder = async (req: Request, res: Response): Promise<any> => {
  const user = req.headers.user as any;
  const body = req.body;
  try {
    const paypalRes = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYPAL_CLIENT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: body.currency,
                value: (Number(body.quantity) * Number(body.price)).toString(),
                breakdown: {
                  item_total: {
                    currency_code: body.currency,
                    value: (Number(body.quantity) * Number(body.price)).toString(),
                  },
                },
              },
              items: [
                {
                  name: body.name,
                  quantity: body.quantity,
                  unit_amount: {
                    currency_code: body.currency,
                    value: body.price,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await paypalRes.json();
    let order: any;

    if (data) {
      order = await orderModel.create({ userId: new ObjectId(user._id), orderId: data.id });
    }

    return response(res, false, 200, "Order created successfully", data);

  } catch (error) {
    serverError(res, error);
  }
};

export const captureOrder = async (req: Request, res: Response): Promise<any> => {
  const user = req.headers.user as any;
  const body = req.body;
  try {
    const paypalRes = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${body.orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${process.env.PAYPAL_CLIENT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({}),
      }
    );

    const data = await paypalRes.json();

    return response(res, false, 200, "Order captured successfully", data);
  } catch (error) {
    serverError(res, error);
  }
};

export const webhook = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawBody = req.body.toString("utf8");
    console.log('rawBody :>> ', rawBody);
    const payload = JSON.parse(rawBody);
    console.log('payload :>> ', payload);

    switch (payload.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
        console.log("inside CHECKOUT.ORDER.APPROVED webhook");
        break;

      case "CHECKOUT.ORDER.COMPLETED":
        console.log("inside CHECKOUT.ORDER.COMPLETED webhook");
        break;

      case "CHECKOUT.PAYMENT-APPROVAL.REVERSED":
        console.log("inside CHECKOUT.PAYMENT-APPROVAL.REVERSED webhook");
        break;

      case "PAYMENT.CAPTURE.COMPLETED":
        console.log("inside PAYMENT.CAPTURE.COMPLETED webhook");
        break;

      default:
        console.log(`Unhandled PayPal webhook event type: ${payload.event_type}`);
    }

    // Acknowledge receipt of the webhook
    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Unhandled PayPal webhook error:", error);
    return res.status(500).json({ error: "Internal server error processing webhook" });
  }
};