// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyD3rAMBuEihI-NhaiWoP6HN3iPumHOO148",
  authDomain: "etsy-templates-pro.firebaseapp.com",
  projectId: "etsy-templates-pro"
});

const auth = firebase.auth(),
      db = firebase.firestore(),
      stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

let cart = [], user = null, freeUsed = false;

// UI Elements
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

function toggleModal(show){
  authModal.classList.toggle('hidden', !show);
}

authBtn.onclick = () => toggleModal(true);
authClose.onclick = () => toggleModal(false);

// Auth mode switch
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

// Auth actions
authSubmit.onclick = () => {
  const email = authEmail.value, pw = authPass.value;
  const action = loginMode
    ? auth.signInWithEmailAndPassword
    : auth.createUserWithEmailAndPassword;

  action.call(auth, email, pw)
    .then(() => {
      toggleModal(false);
      showToast('Welcome!');
    })
    .catch(e => showToast(e.message));
};

resetLink.onclick = e => {
  e.preventDefault();
  auth.sendPasswordResetEmail(authEmail.value)
    .then(() => {
      resetMsg.classList.remove('hidden');
      showToast('Reset email sent!');
    })
    .catch(e => showToast(e.message));
};

// User login state
auth.onAuthStateChanged(u => {
  user = u;
  if(u){
    navAuth.innerHTML = `Hi, ${u.email.split('@')[0]} <button onclick="logout()">Log Out</button>`;
    document.getElementById('ai-section')?.classList.remove('hidden');
    dashboard?.classList.remove('hidden');
    toggleModal(false);
    fetchDownloads();
  } else {
    navAuth.innerHTML = `<button id="auth-btn">Log In / Register</button>`;
    toggleModal(false);
    document.getElementById('auth-btn').onclick = () => toggleModal(true); // re-attach listener
  }
});

function logout(){
  auth.signOut();
  cart = [];
  updateCartUI();
  dashboard?.classList.add('hidden');
}

// Cart
function addToCart(id, price){
  if(!user){ showToast('Please log in'); return; }
  cart.push({ id, price });
  updateCartUI();
}

function updateCartUI(){
  cartList.innerHTML = cart.map((i, idx) =>
    `<li>${i.id} - $${i.price.toFixed(2)} <button onclick="removeFromCart(${idx})">×</button></li>`).join('');
}

function removeFromCart(i){
  cart.splice(i, 1);
  updateCartUI();
}

function checkoutCart(){
  if(cart.length === 0){ showToast('Cart is empty'); return; }
  showToast('Files will be sent via email manually for now.');
  cart.forEach(item => {
    downloadsList.innerHTML += `<li>${item.id} (download link will be emailed)</li>`;
  });
  cart = [];
  updateCartUI();
}

// AI Tool preview (1 free)
aiBtn.onclick = () => {
  if(!user){ showToast('Log in to use AI'); return; }
  if(freeUsed){ showToast('Free preview already used'); return; }

  aiRes.innerText = '';
  showToast('Generating AI preview…');

  axios.post('https://api.openai.com/v1/completions',{
    model: "text-davinci-003",
    prompt: "Create an Etsy listing title and bullets:",
    max_tokens: 80
  },{
    headers:{ Authorization:`Bearer sk-your-openai-key` }
  }).then(r => {
    aiRes.innerText = r.data.choices[0].text;
    freeUsed = true;
    showToast('Here’s your preview!');
  }).catch(err => showToast('Error: ' + err.message));
};

// Downloads from Firebase
function fetchDownloads(){
  db.collection('users').doc(user.uid).get().then(doc => {
    const arr = doc.data()?.purchased || [];
    downloadsList.innerHTML = arr.map(f =>
      `<li><a href="downloads/${f}.zip" download>${f}</a></li>`).join('');
  });
}

// Toast alert
function showToast(message){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'toast';
    t.style = `
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: #222; color: #fff; padding: 12px 20px;
      border-radius: 8px; transition: all 0.4s ease; opacity: 0;
      z-index: 9999; font-size: 14px;
    `;
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.style.opacity = '1';
  t.style.transform = 'translate(-50%, 0)';
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translate(-50%, 20px)';
  }, 3000);
}

// Smooth scroll with toast
function scrollToSection(se){
  document.querySelector(se).scrollIntoView({ behavior:'smooth' });
  showToast('Scrolling...');
          }
