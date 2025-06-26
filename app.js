// Firebase Init
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();

// =========================
// Theme Handling
// =========================
const themeSelect = document.getElementById('theme-select');
const themeFonts = {
  forest: 'Lora, serif',
  rose: 'DM Serif Display, serif',
  dark: 'Roboto Mono, monospace',
  light: 'Playfair Display, serif'
};

function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.body.style.fontFamily = themeFonts[theme] || 'sans-serif';
  localStorage.setItem('theme', theme);
}

// Load saved or default theme
const savedTheme = localStorage.getItem('theme') || 'light';
themeSelect.value = savedTheme;
applyTheme(savedTheme);

// Change theme on select
themeSelect.addEventListener('change', e => {
  applyTheme(e.target.value);
});

// =========================
// Navigation Smooth Scroll
// =========================
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// =========================
// Modal Logic
// =========================
const modal = document.getElementById('auth-modal');
const loginBtn = document.getElementById('login-btn');

function toggleModal() {
  modal.classList.toggle('hidden');
  document.body.style.overflow = modal.classList.contains('hidden') ? '' : 'hidden';
}

// Open on button click only
loginBtn.addEventListener('click', toggleModal);

// =========================
// Auth Handling
// =========================
async function handleAuth() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      await auth.createUserWithEmailAndPassword(email, password);
    } else {
      return alert(err.message);
    }
  }

  await initUser();
  toggleModal();
}

async function initUser() {
  const user = auth.currentUser;
  if (!user) return;
  const ref = db.collection("users").doc(user.uid);
  const doc = await ref.get();

  if (!doc.exists) {
    await ref.set({
      email: user.email,
      credits: 0,
      ai_used: false,
      purchasedProducts: []
    });
  }
}

// =========================
// Try AI Button (from Homepage)
// =========================
document.getElementById('use-free-ai')?.addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) {
    runAiTool();
  } else {
    toggleModal();
  }
});

function runAiTool() {
  alert("🎉 AI Tool would run here! (Replace with your real logic.)");
}
