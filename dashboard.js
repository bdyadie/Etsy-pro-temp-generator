firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

auth.onAuthStateChanged(async user => {
  if (!user) return (location.href = "index.html");
  document.getElementById("nav-user").innerHTML = `<button class="btn" onclick="auth.signOut()">Log Out</button>`;
  document.getElementById("user-email").innerText = user.email;

  const doc = await db.collection("users").doc(user.uid).get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };
  document.getElementById("dashboard-credits").innerText = data.credits;

  const container = document.getElementById("downloads");
  container.innerHTML = data.purchasedProducts.length
    ? data.purchasedProducts.map(p => `<div><a href="downloads/${p}.zip" download>${p}</a></div>`).join("")
    : "<p>No products purchased yet.</p>";

  document.getElementById("dash-buy-credits").onclick = () => {
    fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { Authorization: user.uid }
    })
      .then(res => res.json())
      .then(d => stripe.redirectToCheckout({ sessionId: d.sessionId }));
  };
});
