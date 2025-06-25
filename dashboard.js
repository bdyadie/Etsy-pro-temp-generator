firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // Replace this!

auth.onAuthStateChanged(async u => {
  if (!u) return location = 'index.html';
  document.getElementById('user-email').innerText = u.email;
  document.getElementById('nav-user').innerHTML = `<button onclick="auth.signOut()">Logout</button>`;

  const doc = await db.collection('users').doc(u.uid).get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };
  document.getElementById('dashboard-credits').innerText = data.credits;

  document.getElementById('downloads').innerHTML = data.purchasedProducts.map(
    id => `<div><a href="downloads/${id}.zip" download>${id}</a></div>`
  ).join('');

  document.getElementById('dash-buy-credits').onclick = () => {
    fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { Authorization: u.uid }
    })
    .then(r => r.json())
    .then(d => stripe.redirectToCheckout({ sessionId: d.sessionId }));
  };
});
