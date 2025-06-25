// ✅ Firebase Config (your real keys)
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
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // optional

// -- Auth state listener
auth.onAuthStateChanged(async u => {
  const nav = document.getElementById('auth-state');
  if (u) {
    nav.innerHTML = `Hello ${u.email} <button onclick="logout()">Log Out</button> <button onclick="location='dashboard.html'">Dashboard</button>`;
    toggleSections(true);
    await loadCredits(u.uid);
  } else {
    nav.innerHTML = `<button onclick="login()">Log In / Register</button>`;
    toggleSections(false);
  }
});

// -- Login or register
function login() {
  const e = prompt("Email"), p = prompt("Password");
  auth.signInWithEmailAndPassword(e, p)
    .catch(() => auth.createUserWithEmailAndPassword(e, p)
      .catch(err => alert(err.message)));
}

// -- Logout
function logout() {
  auth.signOut();
}

// -- Forgot password
function resetPassword() {
  const e = prompt("Email:");
  auth.sendPasswordResetEmail(e).then(() => alert("Reset sent")).catch(err => alert(err.message));
}

// -- Toggle site access
function toggleSections(ok) {
  document.getElementById('preview').style.display = ok ? 'none' : 'block';
  document.getElementById('members-only').style.display = ok ? 'block' : 'none';
}

// -- AI demo preview
let guestUsed = false;
document.getElementById('use-ai-guest').onclick = () => {
  if (!guestUsed) {
    demoAI();
    guestUsed = true;
  } else alert("Please log in or buy credits.");
};

function demoAI() {
  document.getElementById('ai-output').innerText = "[Demo AI output]";
}

// -- AI generate logic (for paid users)
document.getElementById('generate-ai').onclick = async () => {
  if (!auth.currentUser || userCredits < 1) return alert("Login and buy credits.");
  const prompt = document.getElementById('user-input').value;
  const r = await fetch('/.netlify/functions/generate-ai', {
    method: 'POST',
    headers: { Authorization: auth.currentUser.uid },
    body: JSON.stringify({ prompt })
  });
  const { result } = await r.json();
  document.getElementById('ai-output').innerText = result;
  userCredits--;
  await db.collection('users').doc(auth.currentUser.uid).set({
    credits: userCredits
  }, { merge: true });
  document.getElementById('credits-left').innerText = `Credits: ${userCredits}`;
};

// -- Load Firestore credits
let userCredits = 0;
async function loadCredits(uid) {
  const doc = await db.collection('users').doc(uid).get();
  const data = doc.exists ? doc.data() : { credits: 0 };
  userCredits = data.credits;
  document.getElementById('credits-left').innerText = `Credits: ${userCredits}`;
}

// -- Buy credits button
document.getElementById('buy-credits').onclick = async () => {
  const res = await fetch('/.netlify/functions/create-checkout', {
    headers: { Authorization: auth.currentUser.uid },
    method: 'POST'
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
};
