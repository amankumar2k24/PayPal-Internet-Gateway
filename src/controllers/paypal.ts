import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

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

export const createOrder = async () => {
    console.log('inside of createOrder')
    const accessToken = await generateAccessToken()

    const response = await axios({
        url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    items: [
                        {
                            name: 'Node.js Complete Course',
                            description: 'Node.js Complete Course with Express and MongoDB',
                            quantity: 1,
                            unit_amount: {
                                currency_code: 'USD',
                                value: '100.00'
                            }
                        }
                    ],

                    amount: {
                        currency_code: 'USD',
                        value: '100.00',
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: '100.00'
                            }
                        }
                    }
                }
            ],

            application_context: {
                return_url: process.env.BASE_URL + '/complete-order',
                cancel_url: process.env.BASE_URL + '/cancel-order',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'manfra.io'
            }
        })
    })

    return response.data.links.find(link => link.rel === 'approve').href
}

export const capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken()

    const response = await axios({
        url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    })

    return response.data
}