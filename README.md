# user_action
In the PayPal Checkout Orders API, the user_action field helps control what the PayPal checkout button says and how the user proceeds. Let's look at what happens when you use different values:

🔹 user_action: "PAY_NOW"
✅ Recommended for most merchants.

Effect: Displays the "Pay Now" button in the PayPal UI.

Purpose: This tells PayPal that you want the buyer to immediately authorize and capture the payment.

It removes extra steps and leads to a faster checkout.

🔹 user_action: "CONTINUE" (or if omitted)
Effect: Displays a "Continue" button in the PayPal UI.

Purpose: This is used if you want the user to review the order on your site after PayPal.

Used in multi-step checkouts or when you want to confirm or modify something after returning from PayPal.

🟥 user_action: "COMPLETE" or user_action: "pay_now" (lowercase)
Invalid values.

PayPal will reject the request or ignore the field.

The correct values are uppercase and strictly defined: only "CONTINUE" or "PAY_NOW" are valid.

✅ Summary
user_action Value	UI Button	Behavior
"PAY_NOW"	Pay Now	User is prompted to immediately pay. Fastest.
"CONTINUE"	Continue	User returns to merchant to confirm.
"pay_now"	❌ Invalid	Ignored or errors out.
"complete"	❌ Invalid	Ignored or errors out.