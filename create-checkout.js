const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.handler = async ({ headers }) => {
  if (!headers.authorization) return { statusCode: 401, body: "Unauthorized" };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: "AI Credits Pack (10)" },
        unit_amount: 500
      },
      quantity: 1
    }],
    success_url: `${process.env.URL}/dashboard.html`,
    cancel_url: process.env.URL,
    metadata: { uid: headers.authorization }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ sessionId: session.id })
  };
};
