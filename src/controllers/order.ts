import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { response, serverError } from "../helpers/response";
import { orderModel } from "../models/order";

// async function generateAccessToken() {
//   const clientId = process.env.PAYPAL_CLIENT_ID!;
//   const clientSecret = process.env.PAYPAL_SECRET!;

//   const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

//   try {
//     const res = await axios.post(
//       "https://api-m.sandbox.paypal.com/v1/oauth2/token",
//       "grant_type=client_credentials",
//       {
//         headers: {
//           Authorization: `Basic ${token}`,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     return res.data.access_token;
//   } catch (error: any) {
//     console.error("Error generating PayPal access token:", error.response?.data || error.message);
//     throw new Error("Failed to generate PayPal access token");
//   }
// }


async function generateAccessToken() {
    console.log('inside of generateAccessToken');

    try {
        const response = await axios({
            url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            method: "post",
            data: "grant_type=client_credentials",
            auth: {
                username: process.env.PAYPAL_CLIENT_ID!,
                password: process.env.PAYPAL_CLIENT_SECRET!
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        console.log('Access Token Received:', response.data.access_token);
        return response.data.access_token;

    } catch (error) {
        console.error('Error generating access token:', error.response?.data || error.message);
        throw error;
    }
}

// export const createOrder = async (req: Request, res: Response): Promise<any> => {
  export const createOrder = async (req: Request, res: Response): Promise<any> => {
  const { currency, quantity, price, name } = req.body;

  // Optionally handle user authentication here
  // const user = req.headers.user as any;  // Ensure user is correctly passed in headers

  try {
    const accessToken = await generateAccessToken();
    console.log("accessToken=>", accessToken);

    const paypalRes = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: (Number(quantity) * Number(price)).toString(),
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: (Number(quantity) * Number(price)).toString(),
                },
              },
            },
            items: [
              {
                name,
                description: 'Node.js Complete Course with Express and MongoDB',
                quantity,
                unit_amount: {
                  currency_code: currency,
                  value: price,
                },
              },
            ],
          },
        ],
        application_context: {
          return_url: process.env.BASE_URL + '/complete-order',
          cancel_url: process.env.BASE_URL + '/cancel-order',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          brand_name: 'manfra.io'
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data: any = paypalRes.data;
    console.log('data', data)
    if (data?.id) {
      await orderModel.create({ orderId: data.id });
    }
    return data.links.find((link: any) => link.rel === 'approve').href

    // res.render("create-order", { orderId: data.id });
  } catch (error: any) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
};

export const captureOrder = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  try {
    const accessToken = await generateAccessToken();

    const paypalRes = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${body.orderId}/capture`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = paypalRes.data;

    return response(res, false, 200, "Order captured successfully", data);
  } catch (error: any) {
    serverError(res, error);
  }
};

export const webhook = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawBody = req.body.toString("utf8");
    console.log("rawBody :>> ", rawBody);
    const payload = JSON.parse(rawBody);
    console.log("payload :>> ", payload);

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

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Unhandled PayPal webhook error:", error);
    return res.status(500).json({ error: "Internal server error processing webhook" });
  }
};
