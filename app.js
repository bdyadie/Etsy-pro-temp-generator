// 🔐 Replace with your Firebase config
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates",
  storageBucket: "etsy-templates.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const auth = firebase.auth();
const db = firebase.firestore();

// 🎨 Theme fonts
const themeFonts = {
  light: "Playfair Display, serif",
  rose: "DM Serif Display, serif",
  forest: "Lora, serif",
  dark: "Roboto Mono, monospace"
};

// 🎨 Apply theme
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.body.style.fontFamily = themeFonts[theme];
  localStorage.setItem("theme", theme);
}

// 🔁 Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// 🎯 Theme switcher (bubbles)
document.querySelectorAll(".theme-bubbles span").forEach(bubble => {
  bubble.addEventListener("click", () => {
    const theme = bubble.dataset.theme;
    applyTheme(theme);
  });
});

// 🧭 Smooth scroll
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// 🔐 Modal toggle
function toggleModal() {
  const modal = document.getElementById("auth-modal");
  modal.classList.toggle("hidden");
  document.body.style.overflow = modal.classList.contains("hidden") ? "" : "hidden";
}
document.getElementById("login-btn").addEventListener("click", toggleModal);

// 🤖 Try AI Tool
document.getElementById("use-free-ai").addEventListener("click", () => {
  const user = auth.currentUser;
  if (user) {
    alert("🎉 AI Tool activated for 1 free use!");
    // Optional: deduct 1 credit or flag in Firestore
  } else {
    toggleModal();
  }
});

// 🔑 Login/Register logic
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

// 🧾 Create Firestore user doc if new
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

// 📦 Buy Now buttons
document.querySelectorAll(".buy-now").forEach(btn => {
  btn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) {
      toggleModal();
    } else {
      alert("✅ Proceed to checkout (not yet implemented).");
    }
  });
});

// 💬 WhatsApp buttons
document.querySelectorAll(".whatsapp").forEach(btn => {
  btn.addEventListener("click", () => {
    window.open("https://wa.me/YOUR_WHATSAPP_NUMBER", "_blank");
  });
});
