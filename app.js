// === Firebase Config ===
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// === Auth Modal Logic ===
const btnAuth = document.getElementById('btn-auth');
btnAuth.addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) {
    auth.signOut();
  } else {
    toggleAuthModal(true);
  }
});

function toggleAuthModal(show) {
  document.getElementById('auth-modal').style.display = show ? 'flex' : 'none';
}
function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(() => auth.createUserWithEmailAndPassword(email, pass)
      .catch(err => alert(err.message)));
}

// === Auth State Changes ===
auth.onAuthStateChanged(user => {
  if (user) {
    btnAuth.textContent = "Logout";
  } else {
    btnAuth.textContent = "Login";
    document.getElementById('members-only')?.classList.add("hidden");
  }
});

// === Theme Switching ===
const themeSelect = document.getElementById('theme-select');
const bubbles = document.querySelectorAll('.bubbles span');

function setTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem("theme", theme);
  themeSelect.value = theme;
}

themeSelect.addEventListener('change', () => {
  setTheme(themeSelect.value);
});

bubbles.forEach(bubble => {
  bubble.addEventListener('click', () => {
    const theme = bubble.getAttribute("data-theme");
    setTheme(theme);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "light";
  setTheme(saved);
});

// === Guest Preview (1 time) ===
let guestUsed = false;
document.getElementById('use-ai-guest')?.addEventListener('click', () => {
  if (!guestUsed) {
    document.getElementById('ai-output').innerText = "[Demo AI output]";
    guestUsed = true;
  } else {
    alert("Please log in or buy credits.");
  }
});

// === Section Anchor Scroll ===
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});
