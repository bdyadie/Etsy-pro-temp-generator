// init Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Scroll header shadow
window.addEventListener('scroll', () => {
  document.querySelector('header').classList.toggle('scrolled', window.scrollY > 10);
});

// Theme switcher: select + bubbles
const themeSelect = document.getElementById('theme-select');
themeSelect.addEventListener('change', e => switchTheme(e.target.value));
document.querySelectorAll('.bubbles span').forEach(el => {
  el.addEventListener('click', () => {
    themeSelect.value = el.dataset.theme;
    switchTheme(el.dataset.theme);
  });
});

function switchTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('theme', theme);
}

// On page load, restore theme
const saved = localStorage.getItem('theme') || 'light';
themeSelect.value = saved;
switchTheme(saved);

// Smooth scroll
document.querySelectorAll('#main-nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

// Auth modal
const loginBtn = document.getElementById('login-btn');
const authModal = document.getElementById('auth-modal');
loginBtn.onclick = () => toggleAuthModal(true);

function toggleAuthModal(show) {
  authModal.hidden = !show;
}

// Login / register
async function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch {
    await auth.createUserWithEmailAndPassword(email, pass);
  }
  toggleAuthModal(false);
}

// Redirect to WhatsApp
document.querySelectorAll('.btn-whatsapp').forEach(btn => {
  btn.addEventListener('click', () => {
    window.open('https://wa.me/YOURWHATSAPPNUMBER', '_blank');
  });
});

// Placeholder for Buy Now
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', () => alert('Trigger buy flow here.'));
});

// AI 'Try AI Tool' button
document.getElementById('use-ai-guest').addEventListener('click', () => {
  toggleAuthModal(true);
});
