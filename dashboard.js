firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates",
  storageBucket: "etsy-templates.firebasestorage.app",
  messagingSenderId: "71763904255",
  appId: "1:71763904255:web:324b5d74e6cbcf2e112eca",
  measurementId: "G-LFBT35J0PV"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // Replace with your real publishable key

auth.onAuthStateChanged(async user => {
  if (!user) return location = 'index.html';

  document.getElementById('user-email').innerText = user.email;
  document.getElementById('nav-user').innerHTML = `<button onclick="auth.signOut()">Logout</button>`;
  document.getElementById('dashboard').style.display = 'block';

  const doc = await db.collection('users').doc(user.uid).get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };

  document.getElementById('dashboard-credits').innerText = data.credits;
  document.getElementById('downloads').innerHTML = data.purchasedProducts.map(
    id => `<div><a href="downloads/${id}.zip" download>${id}</a></div>`
  ).join('');

  document.getElementById('dash-buy-credits').onclick = () => {
    fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { Authorization: user.uid }
    })
    .then(r => r.json())
    .then(d => stripe.redirectToCheckout({ sessionId: d.sessionId }));
  };

  // Load theme
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  document.getElementById('theme-select').value = savedTheme;
});

document.getElementById('theme-select').addEventListener('change', e => {
  const theme = e.target.value;
  localStorage.setItem('theme', theme);
  applyTheme(theme);
});

function applyTheme(theme) {
  document.body.className = '';
  document.body.classList.add(`theme-${theme}`);
  if (theme === 'dark') document.body.classList.add('dark');
}
