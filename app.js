// === Firebase Config ===
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// === Auth State ===
auth.onAuthStateChanged(user => {
  const authBtn = document.getElementById('btn-auth');
  if (user) {
    authBtn.innerText = 'Logout';
    authBtn.onclick = () => auth.signOut();
  } else {
    authBtn.innerText = 'Log In';
    authBtn.onclick = () => toggleAuthModal(true);
  }
});

// === Login / Register Modal ===
function toggleAuthModal(show) {
  document.getElementById('auth-modal').style.display = show ? 'flex' : 'none';
}
function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(() => {
      auth.createUserWithEmailAndPassword(email, pass)
        .catch(err => alert(err.message));
    });
}

// === Theme Switching ===
const themeSelect = document.getElementById('theme-select');
const themeBubbles = document.querySelectorAll('.preview-bubble');
themeSelect.onchange = () => setTheme(themeSelect.value);
themeBubbles.forEach(bubble => {
  bubble.onclick = () => {
    const theme = bubble.getAttribute('data-theme');
    setTheme(theme);
    themeSelect.value = theme;
  };
});
function setTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('theme', theme);
}
window.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem('theme') || 'light';
  setTheme(stored);
  themeSelect.value = stored;
});

// === AI Guest Preview ===
let guestUsed = false;
document.getElementById('use-ai-guest')?.addEventListener('click', () => {
  if (guestUsed) {
    alert("Please log in or buy credits.");
  } else {
    document.getElementById('toast').textContent = "[Demo AI output]";
    guestUsed = true;
  }
});

// === Fade-in Scroll Animation ===
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
});
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// === Smooth Anchor Scroll (Nav Links) ===
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.onclick = function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: "smooth"
    });
  };
});
