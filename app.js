// Initialize Firebase
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
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Theme selection
const themeSelect = document.getElementById("theme-select");
themeSelect.onchange = () => {
  document.body.className = themeSelect.value;
  localStorage.setItem("theme", themeSelect.value);
};

// Restore theme
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "light";
  themeSelect.value = saved;
  document.body.className = saved;
});

// Authentication handling
auth.onAuthStateChanged(user => {
  const nav = document.getElementById("auth-state");
  if (user) {
    nav.innerHTML = `<button class="btn" onclick="logout()">Log Out</button>`;
  } else {
    nav.innerHTML = `<button class="btn" onclick="toggleAuthModal(true)">Log In</button>`;
  }
});

function handleAuth() {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;
  auth
    .signInWithEmailAndPassword(email, pass)
    .catch(() =>
      auth.createUserWithEmailAndPassword(email, pass).catch(err => alert(err.message))
    );
}

function logout() {
  auth.signOut();
}

function toggleAuthModal(open) {
  document.getElementById("auth-modal").style.display = open ? "flex" : "none";
}

// Demo AI functionality for guests
let guestUsed = false;
document.getElementById("use-ai-guest").onclick = () => {
  if (!guestUsed) {
    alert("Demo AI output (replace with real output)");
    guestUsed = true;
  } else {
    alert("Please log in or buy credits.");
  }
};

// Placeholder: Your full AI generate and Stripe purchase logic goes here...
