firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // Replace this

auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "index.html";

  document.getElementById("user-email").textContent = user.email;

  const userRef = db.collection("users").doc(user.uid);
  const doc = await userRef.get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };

  document.getElementById("dashboard-credits").textContent = data.credits || 0;

  const downloads = document.getElementById("downloads");
  const products = data.purchasedProducts || [];

  if (products.length > 0) {
    downloads.innerHTML = products.map(p =>
      `<div><a href="downloads/${p}.zip" class="btn-link" download>${p}</a></div>`
    ).join("");
  } else {
    downloads.innerHTML = "<p>No purchases yet.</p>";
  }

  document.getElementById("dash-buy-credits").onclick = async () => {
    try {
      const res = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { Authorization: user.uid }
      });
      const { sessionId } = await res.json();
      if (sessionId) {
        stripe.redirectToCheckout({ sessionId });
      } else {
        alert("Unable to initiate checkout.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong with checkout.");
    }
  };
});
