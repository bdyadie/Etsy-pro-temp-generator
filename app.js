firebase.initializeApp({
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID"
});
const auth = firebase.auth();

document.getElementById('auth-btn').onclick = () => toggleModal(true);
document.getElementById('auth-close').onclick = () => toggleModal(false);

function toggleModal(show) {
  document.getElementById('auth-modal').classList.toggle('hidden', !show);
}

let loginMode = true;
document.getElementById('switch-auth').onclick = e => {
  e.preventDefault();
  loginMode = !loginMode;
  document.getElementById('auth-title').innerText = loginMode ? 'Log In' : 'Register';
  document.getElementById('auth-submit').innerText = loginMode ? 'Submit' : 'Sign Up';
};

document.getElementById('auth-submit').onclick = () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  const action = loginMode ? auth.signInWithEmailAndPassword : auth.createUserWithEmailAndPassword;
  action.call(auth, email, pass).then(() => toggleModal(false)).catch(err => alert(err.message));
};

document.getElementById('reset-link').onclick = e => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  auth.sendPasswordResetEmail(email).then(() => {
    document.getElementById('reset-msg').classList.remove('hidden');
  }).catch(err => alert(err.message));
};

auth.onAuthStateChanged(user => {
  const nav = document.getElementById('auth-state');
  if (user) {
    nav.innerHTML = `Hi ${user.email.split('@')[0]} <button onclick="logout()">Log Out</button>`;
    document.getElementById('members-only').style.display = 'block';
    document.getElementById('preview').style.display = 'none';
  } else {
    nav.innerHTML = `<button id="auth-btn">Log In / Register</button>`;
    document.getElementById('members-only').style.display = 'none';
    document.getElementById('preview').style.display = 'block';
    document.getElementById('auth-btn').onclick = () => toggleModal(true);
  }
});

function logout() {
  auth.signOut();
}
