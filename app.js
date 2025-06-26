// Firebase Init
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();

// Theme logic
const themeFonts = {
  forest: 'Lora, serif',
  rose: 'DM Serif Display, serif',
  dark: 'Roboto Mono, monospace',
  light: 'Playfair Display, serif'
};

function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.body.style.fontFamily = themeFonts[theme];
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

document.querySelectorAll('.theme-bubbles span').forEach(bubble => {
  bubble.addEventListener('click', () => {
    applyTheme(bubble.dataset.theme);
  });
});

// Smooth scroll
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Modal logic
function toggleModal() {
  const modal = document.getElementById("auth-modal");
  modal.classList.toggle("hidden");
  document.body.style.overflow = modal.classList.contains("hidden") ? '' : 'hidden';
}
document.getElementById("login-btn").addEventListener("click", toggleModal);
document.getElementById("use-free-ai").addEventListener("click", () => {
  const user = auth.currentUser;
  if (user) {
    alert("🎉 AI Tool activated!");
  } else {
    toggleModal();
  }
});

// Login/Register logic
async function handleAuth() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      await auth.createUserWithEmailAndPassword(email, pass);
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
