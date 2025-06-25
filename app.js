// ✅ Firebase Config
firebase.initializeApp({
  apiKey: "AIzaSyD3rAMBuEihI-NhaiWoP6HN3iPumHOO148",
  authDomain: "etsy-templates-pro.firebaseapp.com",
  projectId: "etsy-templates-pro"
});

const auth = firebase.auth(),
      db = firebase.firestore(),
      stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// ✅ App State
let cart = [], user = null, freeUsed = false;

// ✅ UI Elements
const authBtn = document.getElementById('auth-btn'),
      authModal = document.getElementById('auth-modal'),
      authClose = document.getElementById('auth-close'),
      authSubmit = document.getElementById('auth-submit'),
      authEmail = document.getElementById('auth-email'),
      authPass = document.getElementById('auth-password'),
      switchAuth = document.getElementById('switch-auth'),
      resetLink = document.getElementById('reset-link'),
      resetMsg = document.getElementById('reset-msg'),
      navAuth = document.getElementById('nav-auth'),
      aiBtn = document.getElementById('ai-btn'),
      aiRes = document.getElementById('ai-result'),
      cartList = document.getElementById('cart-list'),
      downloadsList = document.getElementById('downloads-list'),
      dashboard = document.getElementById('dashboard');

// ✅ Modal Logic
function toggleModal(show) {
  authModal.classList.toggle('hidden', !show);
}
authBtn.onclick = () => toggleModal(true);
authClose.onclick = () => toggleModal(false);

// ✅ Login/Register Switch
let loginMode = true;
switchAuth.onclick = e => {
  e.preventDefault();
  loginMode = !loginMode;
  document.getElementById('auth-title').innerText = loginMode ? 'Log In' : 'Register';
  authSubmit.innerText = loginMode ? 'Submit' : 'Sign Up';
  switchAuth.innerHTML = loginMode
    ? 'No account? <a href="#">Register</a>'
    : 'Have account? <a href="#">Log In</a>';
};

// ✅ Auth Submit
authSubmit.onclick = () => {
  const email = authEmail.value, pw = authPass.value;
  const action = loginMode
    ? auth.signInWithEmailAndPassword
    : auth.createUserWithEmailAndPassword;

  action.call(auth, email, pw)
    .then(() => {
      toggleModal(false);
      showToast("Welcome back!");
    })
    .catch(e => showToast(e.message));
};

// ✅ Reset Password
resetLink.onclick = e => {
  e.preventDefault();
  auth.sendPasswordResetEmail(authEmail.value)
    .then(() => resetMsg.classList.remove('hidden'))
    .catch(e => showToast(e.message));
};

// ✅ Auth State
auth.onAuthStateChanged(u => {
  user = u;
  if (u) {
    navAuth.innerHTML = `Hi, ${u.email.split('@')[0]} <button onclick="logout()">Log Out</button>`;
    document.getElementById('ai-section').classList.remove('hidden');
    dashboard.classList.remove('hidden');
    fetchDownloads();
  } else {
    navAuth.innerHTML = `<button id="auth-btn">Log In / Register</button>`;
    toggleModal(false);
  }
});

// ✅ Logout
function logout() {
  auth.signOut();
  cart = [];
  updateCartUI();
  dashboard.classList.add('hidden');
}

// ✅ Cart Functions
function addToCart(id, price) {
  if (!user) return showToast('Please log in');
  cart.push({ id, price });
  updateCartUI();
}

function updateCartUI() {
  cartList.innerHTML = cart.map((item, i) =>
    `<li>${item.id} - $${item.price.toFixed(2)} <button onclick="removeFromCart(${i})">×</button></li>`
  ).join('');
}

function removeFromCart(i) {
  cart.splice(i, 1);
  updateCartUI();
}

function checkoutCart() {
  if (cart.length === 0) return showToast('Cart is empty');
  cart.forEach(item => {
    downloadsList.innerHTML += `<li>${item.id} (Download via email)</li>`;
  });
  cart = [];
  updateCartUI();
  showToast("Thank you! Files will be sent to your email.");
}

// ✅ AI Tool
aiBtn.onclick = () => {
  if (!user) return showToast('Please log in first');
  if (freeUsed) return showToast('You’ve already used your free AI preview');

  aiRes.innerText = 'Generating...';
  showToast('Generating AI preview...');

  axios.post('https://api.openai.com/v1/completions', {
    model: "text-davinci-003",
    prompt: "Generate an Etsy product title and bullet points for a handmade item.",
    max_tokens: 80
  }, {
    headers: {
      Authorization: `Bearer sk-your-openai-key`
    }
  }).then(res => {
    aiRes.innerText = res.data.choices[0].text;
    freeUsed = true;
    showToast("Here's your preview!");
  }).catch(err => showToast('Error: ' + err.message));
};

// ✅ Fetch Purchases
function fetchDownloads() {
  db.collection('users').doc(user.uid).get().then(doc => {
    const arr = doc.data()?.purchased || [];
    downloadsList.innerHTML = arr.map(f =>
      `<li><a href="downloads/${f}.zip" download>${f}</a></li>`
    ).join('');
  });
}

// ✅ Toast Notifications
function showToast(message) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `
      position:fixed; bottom:20px; right:20px; background:#333; color:#fff;
      padding:12px 20px; border-radius:6px; opacity:0; transform:translateY(20px);
      transition:opacity 0.4s ease, transform 0.4s ease; z-index:9999;
    `;
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(20px)';
  }, 3000);
}

// ✅ Smooth Scroll
function scrollToSection(sel) {
  const target = typeof sel === 'string' ? document.querySelector(sel) : sel;
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
    showToast('Scrolling...');
  }
  }
