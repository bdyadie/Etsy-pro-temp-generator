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
const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

auth.onAuthStateChanged(u => {
  const nav = document.getElementById('auth-state');
  if (u) {
    nav.innerHTML = `<button class="btn" onclick="logout()">Log Out</button>`;
    document.getElementById('members-only').style.display = 'block';
  } else {
    nav.innerHTML = `<button class="btn" onclick="toggleAuthModal(true)">Log In</button>`;
    document.getElementById('members-only').style.display = 'none';
  }
});
function handleAuth(){
  const e = document.getElementById('auth-email').value;
  const p = document.getElementById('auth-pass').value;
  auth.signInWithEmailAndPassword(e,p)
    .catch(()=>auth.createUserWithEmailAndPassword(e,p)
      .catch(err=>alert(err.message)));
}
function logout(){ auth.signOut(); }
function resetPassword(){
  const e=prompt("Email:");
  auth.sendPasswordResetEmail(e).then(()=>alert("Reset sent")).catch(err=>alert(err.message));
}
function toggleAuthModal(s){
  document.getElementById('auth-modal').style.display = s ? 'flex' : 'none';
}

let guestUsed=false;
document.getElementById('use-ai-guest').onclick = ()=> {
  if(!guestUsed){
    document.getElementById('ai-output').innerText = "[Demo AI output]";
    guestUsed=true;
  } else {
    alert("Please log in or buy credits.");
  }
};

document.getElementById('generate-ai').onclick = async () => {
  if(!auth.currentUser){ alert("Login first"); return; }
  const uid = auth.currentUser.uid;
  const userDoc = await db.collection('users').doc(uid).get();
  const credits = userDoc.exists ? userDoc.data().credits : 0;
  if(credits < 1){ alert("No credits left!"); return; }
  const prompt = document.getElementById('user-input').value;
  const res = await fetch('/.netlify/functions/generate-ai', {
    method:'POST',
    headers:{Authorization:uid},
    body: JSON.stringify({prompt})
  });
  const { result } = await res.json();
  document.getElementById('ai-output').innerText = result;
  await db.collection('users').doc(uid).update({
    credits: firebase.firestore.FieldValue.increment(-1)
  });
  document.getElementById('credits-left').innerText = `Credits: ${credits - 1}`;
};

document.getElementById('buy-credits').onclick = async () => {
  if(!auth.currentUser){ alert("Login first"); return; }
  const res = await fetch('/.netlify/functions/create-checkout', {
    method:'POST',
    headers:{Authorization:auth.currentUser.uid}
  });
  const { sessionId } = await res.json();
  stripe.redirectToCheckout({sessionId});
};

// Theme switching
const themeSelect = document.getElementById('theme-select');
const bubbles = document.querySelectorAll('.preview-bubble');
function setTheme(t){
  document.body.className = t === 'light' ? '' : `theme-${t}`;
  themeSelect.value = t;
}
themeSelect.onchange = () => setTheme(themeSelect.value);
bubbles.forEach(b => b.onclick = () => setTheme(b.dataset.theme));
setTheme('light');
