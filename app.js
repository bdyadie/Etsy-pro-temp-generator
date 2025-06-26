// --- Firebase + Stripe Init ---
firebase.initializeApp({
  apiKey:"AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain:"etsy-templates.firebaseapp.com",
  projectId:"etsy-templates"
});
const auth = firebase.auth(), db = firebase.firestore(), stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// --- Theme Switching ---
const themeSelect = document.getElementById("theme-select"),
      bubbles = document.querySelectorAll(".bubbles span");
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem("theme", theme);
  themeSelect.value = theme;
}
themeSelect.onchange = () => applyTheme(themeSelect.value);
bubbles.forEach(b => b.onclick = () => applyTheme(b.dataset.theme));
window.onload = () => {
  const saved = localStorage.getItem("theme") || "light";
  applyTheme(saved);
};

// --- Auth Modal Handling ---
const authModal = document.getElementById("auth-modal");
function toggleAuthModal(show) {
  authModal.style.display = show ? "flex" : "none";
}
document.getElementById("btn-auth").onclick = () => toggleAuthModal(true);

// --- Authentication ---
async function handleAuth() {
  const email = document.getElementById("auth-email").value,
        pass = document.getElementById("auth-pass").value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    toggleAuthModal(false);
  } catch(e) {
    if (e.code === "auth/user-not-found") {
      try { await auth.createUserWithEmailAndPassword(email, pass); toggleAuthModal(false); }
      catch(err) { alert(err.message) }
    } else alert(e.message);
  }
}

// --- Guest Demo / AI Tool ---
let guestUsed = false;
document.getElementById("use-ai-guest").onclick = () => {
  if (guestUsed) alert("Please log in or buy credits.");
  else { alert("Demo AI output (replace with real)"); guestUsed = true; }
};

// --- Auth State Handling ---
auth.onAuthStateChanged(user => {
  const btnAuth = document.getElementById("btn-auth");
  if (user) {
    btnAuth.textContent = "Log Out";
    btnAuth.onclick = () => auth.signOut();
  } else {
    btnAuth.textContent = "Log In";
    btnAuth.onclick = () => toggleAuthModal(true);
  }
});
