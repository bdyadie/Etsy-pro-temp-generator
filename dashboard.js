// Firebase Init
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Auth check
auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "index.html";

  document.getElementById("user-email").textContent = user.email;

  const userRef = db.collection("users").doc(user.uid);
  const doc = await userRef.get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };

  document.getElementById("dashboard-credits").textContent = data.credits;

  // Show downloads
  const downloads = document.getElementById("downloads");
  if (data.purchasedProducts && data.purchasedProducts.length > 0) {
    downloads.innerHTML = data.purchasedProducts.map(product => `
      <div><a href="downloads/${product}.zip" class="btn-outline" download>${product}</a></div>
    `).join("");
  } else {
    downloads.innerHTML = "<p>No downloads yet.</p>";
  }

  // Buy Credits
  document.getElementById("dash-buy-credits").addEventListener('click', async () => {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { Authorization: user.uid }
    });

    const { sessionId } = await res.json();
    if (sessionId) {
      stripe.redirectToCheckout({ sessionId });
    } else {
      alert("Checkout failed. Please try again.");
    }
  });
});
