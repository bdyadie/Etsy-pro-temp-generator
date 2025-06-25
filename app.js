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
  auth.signInWithEmailAndPassword(email, pass)
    .catch(() => auth.createUserWithEmailAndPassword(email, pass)
      .catch(err => alert(err.message)));
}

function resetPassword() {
  const email = prompt("Enter your email:");
  if (!email) return;
  auth.sendPasswordResetEmail(email).then(() => alert("Reset email sent."));
}

auth.onAuthStateChanged(async user => {
  const nav = document.getElementById("auth-state");
  if (user) {
    nav.innerHTML = `<button class="btn" onclick="logout()">Logout</button>`;
    toggleSections(true);
    await loadCredits(user.uid);
  } else {
    nav.innerHTML = `<button class="btn" onclick="toggleAuthModal(true)">Log In</button>`;
    toggleSections(false);
  }
});

function logout() {
  auth.signOut();
}

function toggleSections(visible) {
  document.getElementById("preview")?.style.display = visible ? "none" : "block";
  document.getElementById("members-only").style.display = visible ? "block" : "none";
}

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
  } else {
    alert("Please log in or buy credits.");
  }
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

  const { result } = await res.json();
  document.getElementById("ai-output").textContent = result;

  userCredits--;
  await db.collection("users").doc(auth.currentUser.uid).set({ credits: userCredits }, { merge: true });
  document.getElementById("credits-left").textContent = `Credits: ${userCredits}`;
};

document.getElementById("buy-credits").onclick = async () => {
  const res = await fetch("/.netlify/functions/create-checkout", {
    method: "POST",
    headers: { Authorization: auth.currentUser.uid }
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
};

// Theme
const themeSelect = document.getElementById("theme-select");
const bubbles = document.querySelectorAll(".preview-bubble");

function setTheme(name) {
  document.body.className = name === "light" ? "" : `theme-${name}`;
  localStorage.setItem("theme", name);
  themeSelect.value = name;

  bubbles.forEach(b => {
    b.classList.remove("active");
    if (b.dataset.theme === name) b.classList.add("active");
  });
}

themeSelect.onchange = () => setTheme(themeSelect.value);
bubbles.forEach(b => {
  b.onclick = () => setTheme(b.dataset.theme);
});

// Apply saved theme
setTheme(localStorage.getItem("theme") || "light");
