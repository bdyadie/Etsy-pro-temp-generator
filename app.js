// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Theme logic
const select = document.getElementById('theme-select');
const bubbles = document.querySelectorAll('.bubbles span');
function applyTheme(t) {
  document.body.className = `theme-${t}`;
  select.value = t;
  bubbles.forEach(b => b.classList.toggle('active', b.dataset.theme===t));
  localStorage.setItem('theme', t);
}
select.onchange = () => applyTheme(select.value);
bubbles.forEach(b=>b.onclick =()=>applyTheme(b.dataset.theme));
applyTheme(localStorage.getItem('theme') || 'light');

// Smooth Nav scrolling
document.querySelectorAll('.nav-btn').forEach(btn=> {
  btn.onclick = () => {
    document.getElementById(btn.dataset.target)
      .scrollIntoView({ behavior: 'smooth' });
  };
});

// Modal
const authModal = document.getElementById('auth-modal');
document.getElementById('btn-auth').onclick = () => authModal.classList.toggle('hidden');
authModal.querySelector('.close-btn').onclick = () => authModal.classList.add('hidden');
window.toggleAuthModal = show => authModal.classList.toggle('hidden', !show);

// Auth handler
window.handleAuth = () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(() => auth.createUserWithEmailAndPassword(email, pass))
    .then(() => authModal.classList.add('hidden'))
    .catch(err => alert(err.message));
};

// Demo AI
let used = false;
document.getElementById('use-ai-guest').onclick = () => {
  if (used) return alert('Please log in or buy credits');
  alert('🎉 Demo AI output here');
  used = true;
};

// Buy & WhatsApp
document.querySelectorAll('.product').forEach((prod, idx) => {
  const buy = prod.querySelector('.btn-buy');
  const wa = prod.querySelector('.btn-whatsapp');
  buy.onclick = () => alert('Stripe purchase flow coming soon');
  wa.onclick = () => {
    const title = prod.querySelector('h3').innerText;
    window.open(`https://wa.me/?text=I'm%20interested%20in%20${encodeURIComponent(title)}`, '_blank');
  };
});
