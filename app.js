// Firebase + Stripe setup
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Theme bubbles handling
document.querySelectorAll('.bubble').forEach(b => {
  b.addEventListener('click', () => {
    const t = b.getAttribute('data-theme');
    document.body.className = `theme-${t}`;
    localStorage.setItem('theme', t);
  });
});
// Restore theme on load
window.addEventListener('DOMContentLoaded', () => {
  const t = localStorage.getItem('theme') || 'light';
  document.body.className = `theme-${t}`;
});

// Navigation scrolling
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.target)?.scrollIntoView({ behavior:'smooth' });
  });
});

// Modal show/hide
function toggleAuthModal(show) {
  document.getElementById('auth-modal').hidden = !show;
}
document.getElementById('btn-auth').addEventListener('click', () => {
  toggleAuthModal(true);
});

// Auth handling placeholder
async function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch {
    await auth.createUserWithEmailAndPassword(email, pass);
  }
  toggleAuthModal(false);
  document.getElementById('btn-auth').innerText = "Logout";
}

// AI guest button placeholder
document.getElementById('use-ai-guest').addEventListener('click', () => {
  alert("AI Tool activated (demo)");
});

// Logout
auth.onAuthStateChanged(u => {
  document.getElementById('btn-auth').innerText = u ? "Logout" : "Log In";
  document.getElementById('btn-auth').onclick = () => u ? auth.signOut() : toggleAuthModal(true);
});
