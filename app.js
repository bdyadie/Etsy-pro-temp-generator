// ⚙️ INIT FIREBASE + STRIPE
firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates",
  storageBucket: "etsy-templates.firebasestorage.app",
  messagingSenderId: "71763904255",
  appId: "1:71763904255:web:324b5d74e6cbcf2e112eca"
});
const auth = firebase.auth(),
      db = firebase.firestore(),
      stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// 🔔 SHOW TOAST
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 2500);
}

// 🔐 TOGGLE AUTH MODAL
function toggleAuthModal(show) {
  document.querySelector(".modal").style.display = show ? "flex" : "none";
}

// 🧠 AUTH ACTION
function handleAuth() {
  const email = document.getElementById("auth-email").value.trim();
  const pass = document.getElementById("auth-pass").value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(() => auth.createUserWithEmailAndPassword(email, pass))
    .catch(err => alert(err.message))
    .finally(() => toggleAuthModal(false));
}

// 🌐 DOM + EVENT BINDING
window.addEventListener("DOMContentLoaded", () => {
  const themeSelect = document.getElementById("theme-select");
  const bubbles = document.querySelectorAll(".preview-bubble");
  const applyTheme = t => {
    document.body.className = "theme-" + t;
    themeSelect.value = t;
    bubbles.forEach(b => b.classList.toggle("active", b.dataset.theme === t));
    localStorage.setItem("theme", t);
  };

  themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
  bubbles.forEach(b => b.addEventListener("click", () => applyTheme(b.dataset.theme)));
  applyTheme(localStorage.getItem("theme") || "light");

  document.getElementById("auth-btn").addEventListener("click", () => {
    auth.currentUser ? auth.signOut() : toggleAuthModal(true);
  });

  document.getElementById("use-ai-guest").addEventListener("click", () => {
    if (window.aiDemoUsed)
      return showToast("Please log in or buy credits!");
    document.getElementById("ai-output").innerText = "[Demo AI output here]";
    window.aiDemoUsed = true;
  });

  document.getElementById("generate-ai").addEventListener("click", async () => {
    if (!auth.currentUser) return showToast("Log in first");
    if (window.userCredits < 1) return showToast("Buy credits first");
    const prompt = document.getElementById("user-input").value.trim();
    if (!prompt) return showToast("Enter your idea first");
    try {
      const res = await fetch("/.netlify/functions/generate-ai", {
        method: "POST",
        headers: { Authorization: auth.currentUser.uid },
        body: JSON.stringify({ prompt })
      });
      const { result } = await res.json();
      document.getElementById("ai-output").innerText = result;
      window.userCredits--;
      await db.collection("users").doc(auth.currentUser.uid).set({ credits: window.userCredits }, { merge: true });
      document.getElementById("credits-left").innerText = `Credits: ${window.userCredits}`;
    } catch (e) {
      console.error(e);
      showToast("Error generating AI");
    }
  });

  document.getElementById("buy-credits").addEventListener("click", async () => {
    if (!auth.currentUser) return showToast("Log in first");
    const resp = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { Authorization: auth.currentUser.uid }
    });
    const { sessionId } = await resp.json();
    stripe.redirectToCheckout({ sessionId });
  });

  auth.onAuthStateChanged(async user => {
    const authBtn = document.getElementById("auth-btn");
    if (user) {
      authBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 6l12 6-12 6z"/></svg> Log Out`;
      document.getElementById("members-only").classList.remove("hidden");

      const doc = await db.collection("users").doc(user.uid).get();
      window.userCredits = doc.exists ? doc.data().credits : 0;
      document.getElementById("credits-left").innerText = `Credits: ${window.userCredits}`;
    } else {
      authBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 7l-5 5 5 5"/></svg> Log In`;
      document.getElementById("members-only").classList.add("hidden");
      window.userCredits = 0;
    }
  });
});

// 🌟 GLOBAL FLAGS
window.aiDemoUsed = false;
window.userCredits = 0;
