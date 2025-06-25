// Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();

// Login modal
function toggleAuthModal(show = false) {
  document.getElementById("auth-modal").style.display = show ? "flex" : "none";
}
function handleAuth() {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(() => auth.createUserWithEmailAndPassword(email, pass)
      .catch(err => alert(err.message)));
}
function resetPassword() {
  const email = prompt("Enter your email:");
  if (!email) return;
  auth.sendPasswordResetEmail(email).then(() => alert("Reset email sent."));
}
auth.onAuthStateChanged(async (user) => {
  const nav = document.getElementById("auth-state");
  if (user) {
    nav.innerHTML = `
      <button class="login-btn-square" onclick="logout()">
        <svg class="login-icon" viewBox="0 0 24 24"><path d="M14 7v3h7v4h-7v3l-5-5 5-5zM4 3h10v2H4v14h10v2H4a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
        <span>Log Out</span>
      </button>
    `;
    toggleSections(true);
    loadCredits(user.uid);
  } else {
    nav.innerHTML = `
      <button class="login-btn-square" onclick="toggleAuthModal(true)">
        <svg class="login-icon" viewBox="0 0 24 24"><path d="M10 17v-3H3v-4h7V7l5 5-5 5zM20 3H10v2h10v14H10v2h10a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>
        <span>Log In</span>
      </button>
    `;
    toggleSections(false);
  }
});
function logout() {
  auth.signOut();
}
function toggleSections(loggedIn) {
  document.getElementById("preview").style.display = loggedIn ? "none" : "block";
  document.getElementById("members-only").style.display = loggedIn ? "block" : "none";
}
async function loadCredits(uid) {
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.exists ? doc.data() : { credits: 0 };
  document.getElementById("credits-left").textContent = `Credits: ${data.credits || 0}`;
}

// AI Guest Preview
let guestUsed = false;
document.getElementById("use-ai-guest").onclick = () => {
  if (!guestUsed) {
    document.getElementById("ai-output").textContent = "[Demo AI output]";
    guestUsed = true;
  } else {
    alert("Please log in or buy credits.");
  }
};

// AI Generator for members
document.getElementById("generate-ai").onclick = async () => {
  if (!auth.currentUser || userCredits < 1) return alert("Login and buy credits.");
  const prompt = document.getElementById("user-input").value;
  const r = await fetch("/.netlify/functions/generate-ai", {
    method: "POST",
    headers: { Authorization: auth.currentUser.uid },
    body: JSON.stringify({ prompt })
  });
  const { result } = await r.json();
  document.getElementById("ai-output").textContent = result;
  userCredits--;
  await db.collection("users").doc(auth.currentUser.uid).set({ credits: userCredits }, { merge: true });
  document.getElementById("credits-left").textContent = `Credits: ${userCredits}`;
};
document.getElementById("buy-credits").onclick = async () => {
  const res = await fetch("/.netlify/functions/create-checkout", {
    headers: { Authorization: auth.currentUser.uid },
    method: "POST"
  });
  const { sessionId } = await res.json();
  Stripe("YOUR_STRIPE_PUBLISHABLE_KEY").redirectToCheckout({ sessionId });
};

// Theme selector
const themeSelect = document.getElementById("theme-select");
const bubbles = document.querySelectorAll(".preview-bubble");
const fade = document.getElementById("theme-fade");

function setTheme(name) {
  document.body.className = name === "light" ? "" : `theme-${name}`;
  themeSelect.value = name;
  localStorage.setItem("theme", name);

  fade.classList.add("active");
  setTimeout(() => fade.classList.remove("active"), 400);

  bubbles.forEach(b => {
    b.classList.remove("active");
    if (b.dataset.theme === name) b.classList.add("active");
  });
}

themeSelect.onchange = () => setTheme(themeSelect.value);
bubbles.forEach(b => {
  b.onclick = () => {
    setTheme(b.dataset.theme);
    b.classList.add("clicked");
    setTimeout(() => b.classList.remove("clicked"), 400);
  };
});

// Custom theme
document.getElementById("color-primary").oninput = e => {
  document.documentElement.style.setProperty("--primary", e.target.value);
};
document.getElementById("color-bg").oninput = e => {
  document.documentElement.style.setProperty("--bg", e.target.value);
};
document.getElementById("color-text").oninput = e => {
  document.documentElement.style.setProperty("--text", e.target.value);
};
function applyCustomTheme() {
  alert("Custom colors applied. Changes are not saved unless added to localStorage.");
}
function resetTheme() {
  setTheme("light");
}

// Load theme on start
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);
