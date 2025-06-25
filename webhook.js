const stripe = require("stripe")(process.env.STRIPE_SECRET);
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

exports.handler = async function (event) {
  const sig = event.headers["stripe-signature"];

  let session;
  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (stripeEvent.type === "checkout.session.completed") {
      session = stripeEvent.data.object;

      const uid = session.metadata.uid;

      // 1. Update Firestore credits
      await admin.firestore().collection('users').doc(uid).set({
        credits: admin.firestore.FieldValue.increment(10),
        purchasedProducts: admin.firestore.FieldValue.arrayUnion("ai-tool")
      }, { merge: true });

      // 2. Send confirmation email
      await admin.firestore().collection('mail').add({
        to: [session.customer_details.email],
        message: {
          subject: "Thanks for your purchase!",
          html: "<p>You now have 10 credits available. Happy listing!</p>"
        }
      });
    }

    return { statusCode: 200 };
  } catch (err) {
    console.error("Webhook error:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }
};
