// Firebase & Stripe init
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});
const auth = firebase.auth();
const db = firebase.firestore();
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Auth modal toggle
window.toggleAuthModal = show => document.getElementById('auth-modal').classList[show ? 'remove' : 'add']('hidden');

// Handle login/register
window.handleAuth = () => {
  const e = document.getElementById('auth-email').value;
  const p = document.getElementById('auth-pass').value;
  auth.signInWithEmailAndPassword(e,p).catch(() =>
    auth.createUserWithEmailAndPassword(e,p)
  ).catch(alert);
};

// Auth button & state
auth.onAuthStateChanged(user => {
  const btn = document.getElementById('auth-btn');
  if (user) {
    btn.textContent = 'Log Out';
    btn.onclick = () => auth.signOut();
    document.getElementById('members-only').classList.remove('hidden');
  } else {
    btn.textContent = 'Log In';
    btn.onclick = () => toggleAuthModal(true);
    document.getElementById('members-only').classList.add('hidden');
  }
});

// Theme switcher logic
const select = document.getElementById('theme-select');
const bubbles = document.querySelectorAll('.bubbles span');
function setTheme(t) {
  document.body.className = 'theme-' + t;
  select.value = t;
}
select.onchange = () => setTheme(select.value);
bubbles.forEach(b => {
  b.onclick = () => setTheme(b.dataset.theme);
});

// Show toast helper
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2400);
}

// Guest AI demo
let guestUsed = false;
document.getElementById('use-ai-guest').onclick = () => {
  if (guestUsed) return showToast('Login or buy credits');
  document.getElementById('ai-output').innerText = '[Demo output…]';
  guestUsed = true;
};

// Stripe purchase
document.getElementById('buy-credits').onclick = () => {
  auth.onAuthStateChanged(user => {
    if (!user) return showToast('Please log in');
    fetch('/.netlify/functions/create-checkout', {
      method: 'POST', headers:{Authorization: user.uid}
    }).then(r => r.json()).then(d => stripe.redirectToCheckout({sessionId: d.sessionId}));
  });
};

// Reset password
window.resetPassword = () => {
  const e = prompt('Enter email:');
  auth.sendPasswordResetEmail(e).then(() => showToast('Sent reset link')).catch(alert);
};
