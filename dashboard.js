// Initialize Firebase
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Auth listener
auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "index.html";

  // Show user email
  document.getElementById("user-email").textContent = user.email;

  // Load user data
  const ref = db.collection("users").doc(user.uid);
  const doc = await ref.get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };

  // Show credits
  document.getElementById("dashboard-credits").textContent = data.credits ?? 0;

  // Show downloads
  const downloadsDiv = document.getElementById("downloads");
  if (data.purchasedProducts && data.purchasedProducts.length > 0) {
    downloadsDiv.innerHTML = data.purchasedProducts.map(p => `
      <div><a href="downloads/${p}.zip" class="btn-outline" download>${p}</a></div>
    `).join("");
  } else {
    downloadsDiv.innerHTML = "<p>No purchases yet.</p>";
  }

  // Buy credits button
  document.getElementById("dash-buy-credits").addEventListener("click", async () => {
    try {
      const res = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { Authorization: user.uid }
      });
      const { sessionId } = await res.json();
      if (sessionId) {
        stripe.redirectToCheckout({ sessionId });
      } else {
        alert("Unable to create checkout session.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to Stripe.");
    }
  });
});
