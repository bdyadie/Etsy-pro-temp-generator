// ✅ Firebase App Config — Replace with your real values!
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates",
  storageBucket: "etsy-templates.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

// ✅ Firebase Modules
const auth = firebase.auth();
const db = firebase.firestore();

// ✅ Theme Font Mapping
const themeFonts = {
  light: "Playfair Display, serif",
  rose: "DM Serif Display, serif",
  forest: "Lora, serif",
  dark: "Roboto Mono, monospace"
};

// ✅ Theme Apply Function
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.body.style.fontFamily = themeFonts[theme];
  localStorage.setItem("theme", theme);
}

// ✅ Load Saved Theme on Page Load
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// ✅ Theme Bubbles: Click to Switch
document.querySelectorAll(".theme-bubbles span").forEach(bubble => {
  bubble.addEventListener("click", () => {
    const theme = bubble.dataset.theme;
    applyTheme(theme);
  });
});

// ✅ Smooth Scroll for Nav Links
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ✅ Modal Toggle Logic
function toggleModal() {
  const modal = document.getElementById("auth-modal");
  modal.classList.toggle("hidden");
  document.body.style.overflow = modal.classList.contains("hidden") ? "" : "hidden";
}
document.getElementById("login-btn").addEventListener("click", toggleModal);

// ✅ Try AI for Free Button
document.getElementById("use-free-ai").addEventListener("click", () => {
  const user = auth.currentUser;
  if (user) {
    alert("🎉 AI Tool activated for 1 free use!");
    // Add AI activation logic here
  } else {
    toggleModal();
  }
});

// ✅ Handle Auth (Login/Register)
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

  await initUser();
  toggleModal();
}

// ✅ Create Firestore User Doc if Missing
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
