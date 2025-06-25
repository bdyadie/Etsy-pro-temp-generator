// -- Firebase Setup
firebase.initializeApp({
  apiKey:"AIzaSyD3rAMBuEihI-NhaiWoP6HN3iPumHOO148",
  authDomain:"etsy-templates-pro-generator.firebaseapp.com",
  projectId:"etsy-templates-pro-generator"
});
const auth = firebase.auth(), db = firebase.firestore();
let cart = [], user = null, freeUsed = false;

// -- Elements
const authBtn=document.getElementById('auth-btn'), authModal=document.getElementById('auth-modal'),
      authClose=document.getElementById('auth-close'), authSubmit=document.getElementById('auth-submit'),
      authEmail=document.getElementById('auth-email'), authPass=document.getElementById('auth-password'),
      switchAuth=document.getElementById('switch-auth'), resetLink=document.getElementById('reset-link'),
      resetMsg=document.getElementById('reset-msg'), navAuth=document.getElementById('nav-auth'),
      aiBtn=document.getElementById('ai-btn'), aiRes=document.getElementById('ai-result'),
      cartList=document.getElementById('cart-list'), downloadsList=document.getElementById('downloads-list'),
      dashboard=document.getElementById('dashboard');

// -- Modal toggle
function toggleModal(show) { authModal.classList.toggle('hidden', !show); }
authBtn.onclick = ()=>toggleModal(true);
authClose.onclick = ()=>toggleModal(false);

// -- Switch login/register
let loginMode=true;
switchAuth.onclick = e => {
  e.preventDefault();
  loginMode = !loginMode;
  document.getElementById('auth-title').innerText = loginMode?'Log In':'Register';
  authSubmit.innerText = loginMode?'Submit':'Sign Up';
  switchAuth.innerHTML = loginMode?'No account? <a href="#">Register</a>':'Have account? <a href="#">Log In</a>';
};

// -- Submit login or register
authSubmit.onclick = () => {
  const email = authEmail.value, pw = authPass.value;
  const action = loginMode ? auth.signInWithEmailAndPassword : auth.createUserWithEmailAndPassword;
  action.call(auth, email, pw)
    .then(()=>toggleModal(false))
    .catch(e=>showToast(e.message));
};

// -- Password reset
resetLink.onclick = e => {
  e.preventDefault();
  auth.sendPasswordResetEmail(authEmail.value)
    .then(()=>resetMsg.classList.remove('hidden'))
    .catch(e=>showToast(e.message));
};

// -- Auth listener
auth.onAuthStateChanged(u => {
  user = u;
  if(u){
    navAuth.innerHTML = `Hi, ${u.email.split('@')[0]} <button onclick="logout()">Log Out</button>`;
    document.getElementById('ai-section').classList.remove('hidden');
    dashboard.classList.remove('hidden');
    fetchDownloads();
  } else {
    navAuth.innerHTML = '<button id="auth-btn">Log In / Register</button>';
    document.getElementById('ai-section').classList.add('hidden');
    dashboard.classList.add('hidden');
  }
});

// -- Logout
function logout(){ auth.signOut(); cart=[]; updateCartUI(); }

// -- Add to cart
function addToCart(id, price){
  if(!user){ showToast('Please log in first'); return; }
  cart.push({ id, price });
  updateCartUI();
}

// -- Cart UI update
function updateCartUI(){
  cartList.innerHTML = cart.map((i, idx)=>`<li>${i.id} - $${i.price.toFixed(2)} <button onclick="removeFromCart(${idx})">×</button></li>`).join('');
}

// -- Remove item
function removeFromCart(i){ cart.splice(i,1); updateCartUI(); }

// -- Checkout (manual email delivery placeholder)
function checkoutCart(){
  if(cart.length===0){ showToast('Cart is empty'); return; }
  cart.forEach(item => downloadsList.innerHTML += `<li>${item.id} — your file will be emailed</li>`);
  showToast('Checkout complete! Check your downloads section.');
  cart = []; updateCartUI();
}

// -- AI Preview
aiBtn.onclick = () => {
  if(!user){ showToast('Log in to use the AI tool'); return; }
  if(freeUsed){ showToast('Free preview already used'); return; }
  aiRes.textContent = 'Generating…';
  showToast('Generating preview…');
  axios.post('https://api.openai.com/v1/completions', {
    model: "text-davinci-003",
    prompt: `Create an Etsy listing title and bullets about: ${document.getElementById('ai-input').value}`,
    max_tokens: 80
  }, { headers: { Authorization: `Bearer sk-your-key-here` } })
    .then(r => {
      aiRes.textContent = r.data.choices[0].text.trim();
      freeUsed = true;
      showToast('Preview ready!');
    })
    .catch(e => showToast('Error: ' + e.message));
};

// -- Firestore downloads listener
function fetchDownloads(){
  db.collection('users').doc(user.uid).get().then(doc => {
    const data = doc.data()?.purchased || [];
    downloadsList.innerHTML = data.map(f=>`<li>${f}</li>`).join('');
  });
}

// -- Toast notifications
function showToast(msg){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(20px);background:#000;color:#fff;padding:1em;border-radius:5px;transition:0.3s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)';}, 3000);
}

// -- Smooth scroll
function scrollToSection(sel){
  document.querySelector(sel).scrollIntoView({ behavior:'smooth' });
  showToast('Scrolling…');
}
