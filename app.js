// ✅ Firebase Initialization
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
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // replace with real key

// ✅ Auth Listener
auth.onAuthStateChanged(async user => {
  const nav = document.getElementById("auth-state");
  if (user) {
    nav.innerHTML = `Hello ${user.email} <button onclick="logout()">Log Out</button> <button onclick="location='dashboard.html'">Dashboard</button>`;
    toggleSections(true);
    await loadCredits(user.uid);
  } else {
    nav.innerHTML = `<button class="btn login-btn" onclick="toggleAuthModal(true)">Log In / Register</button>`;
    toggleSections(false);
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

function toggleSections(ok) {
  document.getElementById("hero").style.display = ok ? "none" : "block";
  document.getElementById("members-only").style.display = ok ? "block" : "none";
}

function toggleAuthModal(show = null) {
  const modal = document.getElementById("auth-modal");
  modal.style.display = show !== null ? (show ? "flex" : "none") : (modal.style.display === "flex" ? "none" : "flex");
}

// ✅ AI Guest Mode
let guestUsed = false;
document.getElementById("use-ai-guest").onclick = () => {
  if (!guestUsed) {
    document.getElementById("ai-output").innerText = "🎨 Example: Elegant Handmade Gold Bracelet with Natural Stones";
    guestUsed = true;
  } else {
    toast("Please log in or buy credits.");
  }
};

// ✅ Generate AI
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

// ✅ Load Credits
let userCredits = 0;
async function loadCredits(uid) {
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.exists ? doc.data() : { credits: 0 };
  userCredits = data.credits;
  document.getElementById("credits-left").innerText = `Credits: ${userCredits}`;
}

// ✅ Stripe Checkout
document.getElementById("buy-credits").onclick = async () => {
  const res = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: { Authorization: auth.currentUser.uid }
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
};

// ✅ Toast System
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

// ✅ Theme Logic
function applyTheme(theme) {
  const fade = document.getElementById("theme-fade");
  fade.classList.add("active");

  setTimeout(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    if (theme === 'dark') document.body.classList.add('dark');
    localStorage.setItem("theme", theme);
    updateThemeIcon(theme);
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

// Toggle icon click = cycle themes
document.getElementById("theme-icon-toggle").onclick = () => {
  const options = ["light", "dark", "forest", "rose"];
  const current = localStorage.getItem("theme") || "light";
  const next = options[(options.indexOf(current) + 1) % options.length];
  applyTheme(next);
  document.getElementById("theme-select").value = next;
};

// Theme dropdown
document.getElementById("theme-select").onchange = (e) => {
  const theme = e.target.value;
  applyTheme(theme);
};

// Theme preview label
const label = document.getElementById("theme-label");
document.querySelectorAll(".preview-swatch").forEach(swatch => {
  swatch.addEventListener("mouseover", () => {
    const theme = swatch.dataset.theme;
    label.textContent = `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`;
    label.style.left = swatch.offsetLeft + "px";
  });
  swatch.addEventListener("mouseleave", () => label.textContent = "");
  swatch.onclick = () => {
    const theme = swatch.dataset.theme;
    document.getElementById("theme-select").value = theme;
    applyTheme(theme);
  };
});

// ✅ Custom User Theme Colors
function applyCustomTheme() {
  const custom = {
    '--primary': document.getElementById('color-primary').value,
    '--bg': document.getElementById('color-bg').value,
    '--text': document.getElementById('color-text').value
  };
  Object.keys(custom).forEach(k => {
    document.documentElement.style.setProperty(k, custom[k]);
  });
  localStorage.setItem('custom-theme', JSON.stringify(custom));
}

function resetTheme() {
  localStorage.removeItem('custom-theme');
  location.reload();
}
