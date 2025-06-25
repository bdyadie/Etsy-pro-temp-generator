// Firebase init
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // Replace with your key

let userCredits = 0;

// Auth modal toggle
function toggleAuthModal(show = false) {
  document.getElementById("auth-modal").style.display = show ? "flex" : "none";
}

// Auth login/register
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

// Auth state
auth.onAuthStateChanged(async (user) => {
  const nav = document.getElementById("auth-state");
  if (user) {
    nav.innerHTML = `<button class="login-btn-square" onclick="logout()">
      <svg class="login-icon" viewBox="0 0 24 24">
        <path d="M14 7v3h7v4h-7v3l-5-5 5-5zM4 3h10v2H4v14h10v2H4a2 2 0 01-2-2V5a2 2 0 012-2z"/>
      </svg>
      <span>Logout</span>
    </button>`;
    toggleSections(true);
    await loadCredits(user.uid);
  } else {
    nav.innerHTML = `<button class="login-btn-square" onclick="toggleAuthModal(true)">
      <svg class="login-icon" viewBox="0 0 24 24">
        <path d="M10 17v-3H3v-4h7V7l5 5-5 5zM20 3H10v2h10v14H10v2h10a2 2 0 002-2V5a2 2 0 00-2-2z"/>
      </svg>
      <span>Login</span>
    </button>`;
    toggleSections(false);
  }
});

function logout() {
  auth.signOut();
}

// Toggle guest vs. member section
function toggleSections(ok) {
  document.getElementById('preview').style.display = ok ? 'none' : 'block';
  document.getElementById('members-only').style.display = ok ? 'block' : 'none';
}

// Load user credits
async function loadCredits(uid) {
  const doc = await db.collection('users').doc(uid).get();
  const data = doc.exists ? doc.data() : { credits: 0 };
  userCredits = data.credits || 0;
  document.getElementById('credits-left').textContent = `Credits: ${userCredits}`;
}

// Guest preview
let guestUsed = false;
document.getElementById('use-ai-guest').onclick = () => {
  if (!guestUsed) {
    document.getElementById("ai-output").textContent = "[Demo AI result for 1 use]";
    guestUsed = true;
  } else {
    alert("Please log in to use again or buy credits.");
  }
};

// AI Generator
document.getElementById("generate-ai").onclick = async () => {
  if (!auth.currentUser || userCredits < 1) return alert("Login and buy credits.");
  const prompt = document.getElementById("user-input").value.trim();
  if (!prompt) return;

  const r = await fetch("/.netlify/functions/generate-ai", {
    method: "POST",
    headers: { Authorization: auth.currentUser.uid },
    body: JSON.stringify({ prompt })
  });

  const { result } = await r.json();
  document.getElementById("ai-output").textContent = result;

  userCredits--;
  await db.collection("users").doc(auth.currentUser.uid).set({
    credits: userCredits
  }, { merge: true });
  document.getElementById("credits-left").textContent = `Credits: ${userCredits}`;
};

// Buy Credits
document.getElementById("buy-credits").onclick = async () => {
  const res = await fetch("/.netlify/functions/create-checkout", {
    headers: { Authorization: auth.currentUser.uid },
    method: "POST"
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
};

// Theme Logic
const themeSelect = document.getElementById("theme-select");
const bubbles = document.querySelectorAll(".preview-bubble");
const fade = document.getElementById("theme-fade");

function setTheme(name) {
  document.body.className = name === "light" ? "" : `theme-${name}`;
  localStorage.setItem("theme", name);
  themeSelect.value = name;

  fade.classList.add("active");
  setTimeout(() => fade.classList.remove("active"), 500);

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

// Load saved theme
setTheme(localStorage.getItem("theme") || "light");
