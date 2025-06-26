firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "index.html";
  document.getElementById("user-email").textContent = user.email;

  const doc = await db.collection("users").doc(user.uid).get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };
  document.getElementById("dashboard-credits").textContent = data.credits;

  const downloads = document.getElementById("downloads");
  if (data.purchasedProducts && data.purchasedProducts.length > 0) {
    downloads.innerHTML = data.purchasedProducts.map(p =>
      `<div><a href="downloads/${p}.zip" class="btn-link" download>${p}</a></div>`
    ).join("");
  } else {
    downloads.innerHTML = "<p>No purchases yet.</p>";
  }

  document.getElementById("dash-buy-credits").onclick = async () => {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { Authorization: user.uid }
    });
    const { sessionId } = await res.json();
    stripe.redirectToCheckout({ sessionId });
  };
});
