const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.handler = async ({ headers }) => {
  const uid = headers.authorization;

  if (!uid) return { statusCode: 401, body: "Unauthorized" };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "AI Credits Pack (10)" },
          unit_amount: 500 // $5
        },
        quantity: 1
      }],
      success_url: `${process.env.URL}/dashboard.html`,
      cancel_url: process.env.URL,
      metadata: { uid }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
