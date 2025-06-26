// Initialize Firebase and Stripe
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Wait for auth state
auth.onAuthStateChanged(async user => {
  if (!user) {
    return (location.href = "index.html");
  }

  // Show logout button
  document.getElementById("nav-user").innerHTML =
    '<button class="btn btn-primary" id="logout-btn">Log Out</button>';
  document.getElementById("logout-btn").onclick = () => auth.signOut();

  // Display user email
  document.getElementById("user-email").textContent = user.email;

  // Fetch user data
  const doc = await db.collection("users").doc(user.uid).get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };

  document.getElementById("dashboard-credits").textContent = data.credits;

  // List downloadable items
  const dl = document.getElementById("downloads");
  dl.innerHTML = data.purchasedProducts.length
    ? data.purchasedProducts
        .map(
          p =>
            `<div class="download-item"><a href="downloads/${p}.zip" download>${p}</a></div>`
        )
        .join("")
    : "<p>No purchases yet. Buy a template to get downloads.</p>";

  // Hook up Buy Credits button
  document.getElementById("dash-buy-credits").onclick = async () => {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { Authorization: user.uid }
    });
    const { sessionId } = await res.json();
    stripe.redirectToCheckout({ sessionId });
  };
});
