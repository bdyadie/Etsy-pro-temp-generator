firebase.initializeApp({
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID"
});

const auth = firebase.auth(), db = firebase.firestore(), stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

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

function login() {
  const e = prompt("Email"), p = prompt("Password");
  auth.signInWithEmailAndPassword(e, p).catch(() => {
    auth.createUserWithEmailAndPassword(e, p).catch(err => alert(err.message));
  });
}
function logout() { auth.signOut(); }
function resetPassword() {
  const e = prompt("Enter your email:");
  auth.sendPasswordResetEmail(e).then(() => alert("Reset link sent")).catch(err => alert(err.message));
}

let guestUsed = false;
document.getElementById('use-ai-guest').onclick = () => {
  if (!guestUsed) { demoAI(); guestUsed = true; }
  else showToast("Please log in or buy credits.");
};

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
  const el = document.getElementById('ai-output');
  const text = "Example AI-generated Etsy listing description...";
  el.innerText = '';
  let i = 0;
  const typer = setInterval(() => {
    el.innerText += text[i++];
    if (i >= text.length) clearInterval(typer);
  }, 30);
}

document.getElementById('buy-credits').onclick = async () => {
  const res = await fetch('/.netlify/functions/create-checkout', {
    headers: { Authorization: auth.currentUser.uid },
    method: 'POST'
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({ sessionId });
};

document.getElementById('generate-ai').onclick = async () => {
  if (!auth.currentUser || userCredits < 1) return showToast("Login and buy credits.");
  const prompt = document.getElementById('user-input').value;
  const r = await fetch('/.netlify/functions/generate-ai', {
    method: 'POST',
    headers: { Authorization: auth.currentUser.uid },
    body: JSON.stringify({ prompt })
  });
  const { result } = await r.json();
  const el = document.getElementById('ai-output');
  el.innerText = '';
  let i = 0;
  const typer = setInterval(() => {
    el.innerText += result[i++];
    if (i >= result.length) clearInterval(typer);
  }, 30);
  userCredits--;
  await db.collection('users').doc(auth.currentUser.uid).set({ credits: userCredits }, { merge: true });
  document.getElementById('credits-left').innerText = `Credits: ${userCredits}`;
};

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.className = 'show';
  setTimeout(() => { toast.className = ''; }, 3000);
}

// Fade-in animation
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });
fadeEls.forEach(el => observer.observe(el));
