// Firebase
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

// Auth
auth.onAuthStateChanged(user => {
  const nav = document.getElementById('auth-state');
  if (user) {
    nav.innerHTML = `<button class="btn" onclick="logout()">Log Out</button>`;
    document.getElementById('members-only').style.display = 'block';
  } else {
    nav.innerHTML = `<button class="btn" onclick="toggleAuthModal(true)">Log In</button>`;
    document.getElementById('members-only').style.display = 'none';
  }
});
function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  auth.signInWithEmailAndPassword(email, pass).catch(() => {
    auth.createUserWithEmailAndPassword(email, pass)
      .catch(err => alert(err.message));
  });
}
function logout() {
  auth.signOut();
}
function resetPassword() {
  const email = prompt("Email:");
  auth.sendPasswordResetEmail(email).then(() => alert("Reset sent"));
}
function toggleAuthModal(show) {
  document.getElementById('auth-modal').style.display = show ? 'flex' : 'none';
}

// AI demo
document.getElementById('use-ai-guest').onclick = () => {
  document.getElementById('ai-output').innerText = "[Demo AI Output Here]";
};

// Theme switching
const themeSelect = document.getElementById('theme-select');
themeSelect.onchange = e => setTheme(e.target.value);
document.querySelectorAll('.preview-bubble').forEach(b => {
  b.onclick = () => setTheme(b.dataset.theme);
});
function setTheme(theme) {
  document.body.className = `theme-${theme}`;
  themeSelect.value = theme;
}
