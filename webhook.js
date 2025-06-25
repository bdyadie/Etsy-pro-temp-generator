const stripe = require("stripe")(process.env.STRIPE_SECRET);
const admin = require("firebase-admin");
admin.initializeApp();

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const ev = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  if (ev.type === "checkout.session.completed") {
    const session = ev.data.object;
    await admin.firestore().collection('users').doc(session.metadata.uid).set({
      credits: admin.firestore.FieldValue.increment(10),
      purchasedProducts: admin.firestore.FieldValue.arrayUnion('ai-tool')
    }, { merge: true });
  }
  return { statusCode:200 };
};
