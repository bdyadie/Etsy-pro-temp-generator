const stripe = Stripe("YOUR_STRIPE_PUBLIC_KEY");

// Initialize user doc if first login
async function initUserDocument() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = db.collection("users").doc(user.uid);
  const doc = await ref.get();
  if (!doc.exists) {
    await ref.set({
      email: user.email,
      credits: 0,
      ai_used: false,
      purchasedProducts: []
    });
  }
}

// Trigger AI Tool Use
async function tryAiTool() {
  const user = auth.currentUser;
  if (!user) {
    toggleAuthModal(true); // ask user to log in
    return;
  }

  const ref = db.collection("users").doc(user.uid);
  const doc = await ref.get();
  const data = doc.data();

  if (!data.ai_used) {
    alert("✅ You've activated your free AI use!");
    await ref.update({ ai_used: true });
    runAiTool();
  } else if (data.credits > 0) {
    await ref.update({ credits: data.credits - 1 });
    alert("✅ 1 credit used");
    runAiTool();
  } else {
    alert("❌ You’re out of credits. Please buy more to continue.");
  }
}

// Placeholder for actual AI logic
function runAiTool() {
  alert("🎉 AI Tool running! (Replace this with your actual logic)");
}

// Trigger checkout
async function buyCredits() {
  const user = auth.currentUser;
  if (!user) {
    toggleAuthModal(true);
    return;
  }

  const res = await fetch("/.netlify/functions/create-checkout", {
    method: "POST",
    headers: { Authorization: user.uid }
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
}
