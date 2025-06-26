// Firebase initialization
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();

// Add shadow on scroll
window.addEventListener('scroll', () => {
  document.querySelector('header').classList.toggle('scrolled', window.scrollY > 10);
});

// Theme select logic
const themeSelect = document.getElementById('theme-select');
themeSelect.addEventListener('change', e => switchTheme(e.target.value));
document.querySelectorAll('.bubbles span').forEach(el => {
  el.addEventListener('click', () => {
    themeSelect.value = el.dataset.theme;
    switchTheme(el.dataset.theme);
  });
});

function switchTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('theme', theme);
}
themeSelect.value = localStorage.getItem('theme') || 'light';
switchTheme(themeSelect.value);

// Smooth scroll nav
document.querySelectorAll('#main-nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

// Modal control
const loginBtn = document.getElementById('login-btn');
const authModal = document.getElementById('auth-modal');
loginBtn.onclick = () => toggleAuthModal(true);

function toggleAuthModal(show) {
  authModal.hidden = !show;
  document.body.style.overflow = show ? 'hidden' : '';
  console.log("toggleAuthModal(" + show + ")");
}

// Auth logic
async function handleAuth(event) {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  const btn = event.target;
  btn.disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      try {
        await auth.createUserWithEmailAndPassword(email, pass);
      } catch (regErr) {
        alert(regErr.message);
        btn.disabled = false;
        return;
      }
    } else {
      alert(err.message);
      btn.disabled = false;
      return;
    }
  }

  await initUserDocument();
  toggleAuthModal(false);
  btn.disabled = false;
}

// WhatsApp
document.querySelectorAll('.btn-whatsapp').forEach(btn => {
  btn.addEventListener('click', () => {
    window.open('https://wa.me/YOURWHATSAPPNUMBER', '_blank');
  });
});

// Buy buttons
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
      tryAiTool();
    } else {
      toggleAuthModal(true);
    }
  });
});

// Try AI Tool button
document.getElementById('use-ai-guest').addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) {
    tryAiTool();
  } else {
    toggleAuthModal(true);
  }
});
