const stripe=require("stripe")(process.env.STRIPE_SECRET),admin=require("firebase-admin");admin.initializeApp();
exports.handler=async(event)=>{
  const sig=event.headers["stripe-signature"], ev=stripe.webhooks.constructEvent(event.body,sig,process.env.STRIPE_WEBHOOK_SECRET);
  if(ev.type==="checkout.session.completed"){
    const sess=ev.data.object;
    await admin.firestore().collection('users').doc(sess.metadata.uid).set({credits:admin.firestore.FieldValue.increment(10),purchasedProducts:admin.firestore.FieldValue.arrayUnion('ai-tool')},{merge:true});
    await admin.firestore().collection('mail').add({to:[sess.customer_details.email],message:{subject:"Thanks for your purchase!",html:"You now have 10 credits."}});
  }
  return {statusCode:200};
};