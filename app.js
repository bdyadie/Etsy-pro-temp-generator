firebase.initializeApp({
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID"
});

const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

auth.onAuthStateChanged(async (user) => {
  const nav = document.getElementById('auth-state') || document.getElementById('nav-auth');
  if (user) {
    nav.innerHTML = `Hello ${user.email.split('@')[0]} <button onclick="logout()">Log Out</button>`;
    toggleSections(true);
    await loadCredits(user.uid);
  } else {
    nav.innerHTML = `<button onclick="login()">Log In / Register</button>`;
    toggleSections(false);
  }
});

function login() {
  const e = prompt("Email");
  const p = prompt("Password");
  auth.signInWithEmailAndPassword(e, p)
    .catch(() => auth.createUserWithEmailAndPassword(e, p).catch(err => alert(err.message)));
}

function logout() {
  auth.signOut();
}

function resetPassword() {
  const e = prompt("Enter email:");
  auth.sendPasswordResetEmail(e).then(() => alert("Reset link sent")).catch(err => alert(err.message));
}

let guestUsed = false;
document.getElementById('use-ai-guest')?.addEventListener('click', () => {
  if (!guestUsed) {
    demoAI();
    guestUsed = true;
  } else {
    alert("Please log in or buy credits.");
  }
});

function toggleSections(show) {
  document.getElementById('preview').style.display = show ? 'none' : 'block';
  document.getElementById('members-only').style.display = show ? 'block' : 'none';
}

let userCredits = 0;
async function loadCredits(uid) {
  const doc = await db.collection('users').doc(uid).get();
  const data = doc.exists ? doc.data() : { credits: 0 };
  userCredits = data.credits;
  document.getElementById('credits-left').innerText = `Credits: ${userCredits}`;
}

function demoAI() {
  document.getElementById('ai-output').innerText = "[Demo AI output: Etsy listing title, bullets, and description.]";
}

document.getElementById('buy-credits')?.addEventListener('click', async () => {
  const res = await fetch('/.netlify/functions/create-checkout', {
    headers: { Authorization: auth.currentUser.uid },
    method: 'POST'
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
});

document.getElementById('generate-ai')?.addEventListener('click', async () => {
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
  await db.collection('users').doc(auth.currentUser.uid).set({ credits: userCredits }, { merge: true });
  document.getElementById('credits-left').innerText = `Credits: ${userCredits}`;
});
