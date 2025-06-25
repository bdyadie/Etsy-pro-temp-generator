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
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // ← Replace with your real key

// ✅ Auth State Listener
auth.onAuthStateChanged(async user => {
  const nav = document.getElementById('auth-state');
  if (user) {
    nav.innerHTML = `Hello ${user.email} <button onclick="logout()">Log Out</button> <button onclick="location='dashboard.html'">Dashboard</button>`;
    toggleSections(true);
    await loadCredits(user.uid);
  } else {
    nav.innerHTML = `<button onclick="toggleAuthModal(true)">Log In / Register</button>`;
    toggleSections(false);
  }
});

// ✅ Auth Handlers
function login() {
  toggleAuthModal(true);
}

function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
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
  auth.sendPasswordResetEmail(email)
    .then(() => toast("Password reset email sent."))
    .catch(err => toast(err.message));
}

function toggleSections(loggedIn) {
  document.getElementById('hero').style.display = loggedIn ? 'none' : 'block';
  document.getElementById('members-only').style.display = loggedIn ? 'block' : 'none';
}

// ✅ AI Guest Access (1 free demo)
let guestUsed = false;
document.getElementById('use-ai-guest').onclick = () => {
  if (!guestUsed) {
    demoAI();
    guestUsed = true;
  } else {
    toast("Please log in or buy credits.");
  }
};

function demoAI() {
  document.getElementById('ai-output').innerText = "🎨 Example: 'Elegant Handmade Gold Bracelet with Natural Stones'";
}

// ✅ Generate AI Content (for logged-in users)
document.getElementById('generate-ai').onclick = async () => {
  if (!auth.currentUser || userCredits < 1) {
    toast("Login and buy credits first.");
    return;
  }

  const prompt = document.getElementById('user-input').value;
  const res = await fetch('/.netlify/functions/generate-ai', {
    method: 'POST',
    headers: { Authorization: auth.currentUser.uid },
    body: JSON.stringify({ prompt })
  });

  const { result } = await res.json();
  document.getElementById('ai-output').innerText = result;
  userCredits--;

  await db.collection('users').doc(auth.currentUser.uid).set({ credits: userCredits }, { merge: true });
  document.getElementById('credits-left').innerText = `Credits: ${userCredits}`;
};

// ✅ Load Credits
let userCredits = 0;
async function loadCredits(uid) {
  const doc = await db.collection('users').doc(uid).get();
  userCredits = doc.exists ? doc.data().credits : 0;
  document.getElementById('credits-left').innerText = `Credits: ${userCredits}`;
}

// ✅ Stripe Checkout
document.getElementById('buy-credits').onclick = async () => {
  const res = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: { Authorization: auth.currentUser.uid }
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
};

// ✅ Theme Selector + Dark Mode
const themeSelect = document.getElementById('theme-select');
themeSelect.addEventListener('change', () => {
  const theme = themeSelect.value;
  applyTheme(theme);
  localStorage.setItem('theme', theme);
});

function applyTheme(theme) {
  document.body.className = '';
  document.body.classList.add(`theme-${theme}`);
  if (theme === 'dark') document.body.classList.add('dark');
}

window.addEventListener('load', () => {
  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);
  themeSelect.value = saved;
});

// ✅ Toast Function
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.style.opacity = 1;
  el.style.transform = "translateX(-50%) translateY(0)";
  setTimeout(() => {
    el.style.opacity = 0;
    el.style.transform = "translateX(-50%) translateY(20px)";
  }, 3000);
}

// ✅ Modal Logic
function toggleAuthModal(show = null) {
  const modal = document.getElementById('auth-modal');
  const isVisible = modal.style.display === 'flex';
  modal.style.display = show !== null ? (show ? 'flex' : 'none') : (isVisible ? 'none' : 'flex');
}
