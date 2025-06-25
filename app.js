firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

let userCredits = 0;

function toggleAuthModal(show = false) {
  document.getElementById("auth-modal").style.display = show ? "flex" : "none";
}

function handleAuth() {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;
  auth.signInWithEmailAndPassword(email, pass).catch(() => {
    auth.createUserWithEmailAndPassword(email, pass).catch(err => alert(err.message));
  });
}

function resetPassword() {
  const email = prompt("Enter your email:");
  if (!email) return;
  auth.sendPasswordResetEmail(email).then(() => alert("Password reset email sent."));
}

auth.onAuthStateChanged(async user => {
  const nav = document.getElementById("auth-state");
  if (user) {
    nav.innerHTML = `<button class="btn" onclick="auth.signOut()">Logout</button>`;
    document.getElementById("members-only").style.display = "block";
    document.getElementById("hero").style.display = "none";
    await loadCredits(user.uid);
  } else {
    nav.innerHTML = `<button class="btn" onclick="toggleAuthModal(true)">Log In / Register</button>`;
    document.getElementById("members-only").style.display = "none";
    document.getElementById("hero").style.display = "block";
  }
});

async function loadCredits(uid) {
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.exists ? doc.data() : { credits: 0 };
  userCredits = data.credits || 0;
  document.getElementById("credits-left").textContent = `Credits: ${userCredits}`;
}

let guestUsed = false;
document.getElementById("use-ai-guest").onclick = () => {
  if (!guestUsed) {
    document.getElementById("ai-output").textContent = "[Demo AI output]";
    guestUsed = true;
  } else alert("Please log in or buy credits.");
};

document.getElementById("generate-ai").onclick = async () => {
  if (!auth.currentUser || userCredits < 1) return alert("Login and buy credits.");
  const prompt = document.getElementById("user-input").value.trim();
  if (!prompt) return;

  const res = await fetch("/.netlify/functions/generate-ai", {
    method: "POST",
    headers: { Authorization: auth.currentUser.uid },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  document.getElementById("ai-output").textContent = data.result;

  userCredits--;
  await db.collection("users").doc(auth.currentUser.uid)
    .set({ credits: userCredits }, { merge: true });
  document.getElementById("credits-left").textContent = `Credits: ${userCredits}`;
};

document.getElementById("buy-credits").onclick = async () => {
  const res = await fetch("/.netlify/functions/create-checkout", {
    method: "POST",
    headers: { Authorization: auth.currentUser.uid }
  });
  const data = await res.json();
  stripe.redirectToCheckout({ sessionId: data.sessionId });
};

// Theme management
const themeSelect = document.getElementById("theme-select");
const bubbles = document.querySelectorAll(".preview-bubble");
const fade = document.getElementById("theme-fade");

function setTheme(name) {
  document.body.className = name === "light" ? "" : `theme-${name}`;
  localStorage.setItem("theme", name);
  themeSelect.value = name;
  fade.classList.add("active");
  setTimeout(() => fade.classList.remove("active"), 500);
  bubbles.forEach(b => b.classList.toggle("active", b.dataset.theme === name));
}

themeSelect.onchange = () => setTheme(themeSelect.value);
bubbles.forEach(b => b.onclick = () => setTheme(b.dataset.theme));

setTheme(localStorage.getItem("theme") || "light");
