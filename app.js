// Initialize Firebase
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();

// Map theme → font
const themeFonts = {
  light: "Playfair Display, serif",
  rose: "DM Serif Display, serif",
  forest: "Lora, serif",
  dark: "Roboto Mono, monospace"
};

// Apply theme from selection
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.body.style.fontFamily = themeFonts[theme];
  localStorage.setItem("theme", theme);
}

// Load saved theme on page load
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Theme switch bubbles
document.querySelectorAll(".theme-bubbles span").forEach(bubble => {
  bubble.addEventListener("click", () => {
    applyTheme(bubble.dataset.theme);
  });
});

// Smooth scroll for nav links
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Modal open/close
function toggleModal() {
  const modal = document.getElementById("auth-modal");
  modal.classList.toggle("hidden");
  document.body.style.overflow = modal.classList.contains("hidden") ? "" : "hidden";
}
document.getElementById("login-btn").addEventListener("click", toggleModal);

// AI Tool - Free use or prompt login
document.getElementById("use-free-ai").addEventListener("click", () => {
  const user = auth.currentUser;
  if (user) {
    alert("🎉 AI Tool activated for 1 free use!");
    // You could add logic to decrement credits or record usage here
  } else {
    toggleModal();
  }
});

// Handle login/register logic
async function handleAuth() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await auth.createUserWithEmailAndPassword(email, password);
    } else {
      alert(err.message);
      return;
    }
  }

  await initUser(); // sets up Firestore if new user
  toggleModal();
}

// Create Firestore user doc if needed
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
