// ✅ Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates",
  storageBucket: "etsy-templates.firebasestorage.app",
  messagingSenderId: "71763904255",
  appId: "1:71763904255:web:324b5d74e6cbcf2e112eca",
  measurementId: "G-LFBT35J0PV"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // Replace this

// 🔐 Auth handling
auth.onAuthStateChanged(async user => {
  if (user) {
    document.getElementById("hero").style.display = "none";
    document.getElementById("members-only").style.display = "block";
    document.getElementById("auth-modal").style.display = "none";
    const doc = await db.collection("users").doc(user.uid).get();
    userCredits = doc.exists ? doc.data().credits || 0 : 0;
    document.getElementById("credits-left").innerText = `Credits: ${userCredits}`;
  } else {
    document.getElementById("hero").style.display = "block";
    document.getElementById("members-only").style.display = "none";
  }
});

function handleAuth() {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(() => auth.createUserWithEmailAndPassword(email, pass)
      .catch(err => toast(err.message)))
    .then(() => toggleAuthModal(false));
}

function logout() {
  auth.signOut();
}

function resetPassword() {
  const email = prompt("Enter your email:");
  auth.sendPasswordResetEmail(email).then(() => toast("Password reset sent.")).catch(err => toast(err.message));
}

function toggleAuthModal(show = null) {
  const modal = document.getElementById("auth-modal");
  modal.style.display = show !== null ? (show ? "flex" : "none") : (modal.style.display === "flex" ? "none" : "flex");
}

// 🧠 Guest AI
let guestUsed = false;
document.getElementById("use-ai-guest").onclick = () => {
  if (!guestUsed) {
    document.getElementById("ai-output").innerText = "[Demo output: Your AI listing here]";
    guestUsed = true;
  } else toast("Please log in or buy credits.");
};

// 🧠 Generate AI
let userCredits = 0;
document.getElementById("generate-ai").onclick = async () => {
  if (!auth.currentUser || userCredits < 1) return toast("Login and buy credits first.");

  const prompt = document.getElementById("user-input").value;
  const res = await fetch('/.netlify/functions/generate-ai', {
    method: 'POST',
    headers: { Authorization: auth.currentUser.uid },
    body: JSON.stringify({ prompt })
  });
  const { result } = await res.json();
  document.getElementById("ai-output").innerText = result;
  userCredits--;

  await db.collection("users").doc(auth.currentUser.uid).set({ credits: userCredits }, { merge: true });
  document.getElementById("credits-left").innerText = `Credits: ${userCredits}`;
};

// 💳 Stripe
document.getElementById("buy-credits").onclick = async () => {
  const res = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: { Authorization: auth.currentUser.uid }
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
};

// 🔔 Toast
function toast(msg) {
  const el = document.getElementById("toast");
  el.innerText = msg;
  el.style.opacity = 1;
  el.style.transform = "translateX(-50%) translateY(0)";
  setTimeout(() => {
    el.style.opacity = 0;
    el.style.transform = "translateX(-50%) translateY(20px)";
  }, 3000);
}

// 🎨 Theme
function applyTheme(theme) {
  const fade = document.getElementById("theme-fade");
  fade.classList.add("active");

  setTimeout(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    if (theme === 'dark') document.body.classList.add('dark');
    localStorage.setItem("theme", theme);
    updateThemeIcon(theme);
    highlightThemeBubble(theme);
    setTimeout(() => fade.classList.remove("active"), 300);
  }, 150);
}

function updateThemeIcon(theme) {
  const icon = {
    light: "🌞",
    dark: "🌙",
    forest: "🌲",
    rose: "🌹"
  };
  document.getElementById("theme-icon-toggle").textContent = icon[theme] || "🎨";
}

// Load theme + bubbles
window.addEventListener("load", () => {
  const theme = localStorage.getItem("theme") || "light";
  applyTheme(theme);
  document.getElementById("theme-select").value = theme;

  const saved = localStorage.getItem('custom-theme');
  if (saved) {
    const custom = JSON.parse(saved);
    Object.entries(custom).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }
});

// Icon click = cycle themes
document.getElementById("theme-icon-toggle").onclick = () => {
  const options = ["light", "dark", "forest", "rose"];
  const current = localStorage.getItem("theme") || "light";
  const next = options[(options.indexOf(current) + 1) % options.length];
  applyTheme(next);
  document.getElementById("theme-select").value = next;
};

// Select dropdown change
document.getElementById("theme-select").onchange = e => {
  const theme = e.target.value;
  applyTheme(theme);
};

// Bubble preview handling
function highlightThemeBubble(theme) {
  const bubbles = document.querySelectorAll(".preview-bubble");
  bubbles.forEach(b => b.classList.remove("active"));
  const activeBubble = document.querySelector(`.preview-bubble[data-theme="${theme}"]`);
  if (activeBubble) activeBubble.classList.add("active");
}

document.querySelectorAll(".preview-bubble").forEach(bubble => {
  bubble.onclick = () => {
    const theme = bubble.dataset.theme;
    applyTheme(theme);
    document.getElementById("theme-select").value = theme;
    bubble.classList.add("clicked");
    setTimeout(() => bubble.classList.remove("clicked"), 300);
  };
});

// 🎛️ Custom Theme Panel
function applyCustomTheme() {
  const custom = {
    '--primary': document.getElementById('color-primary').value,
    '--bg': document.getElementById('color-bg').value,
    '--text': document.getElementById('color-text').value
  };
  Object.entries(custom).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
  localStorage.setItem('custom-theme', JSON.stringify(custom));
}

function resetTheme() {
  localStorage.removeItem('custom-theme');
  location.reload();
    }
