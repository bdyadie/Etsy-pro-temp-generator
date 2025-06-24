firebase.initializeApp({ apiKey:"FIREBASE_API_KEY", authDomain:"FIREBASE_AUTH_DOMAIN", projectId:"FIREBASE_PROJECT_ID" });
const auth=firebase.auth(), db=firebase.firestore(), stripe=Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Auth state
auth.onAuthStateChanged(async u=>{
  const nav=document.getElementById('auth-state');
  if(u){
    nav.innerHTML=`Hello ${u.email} <button onclick="logout()">Log Out</button><button onclick="location='dashboard.html'">Dashboard</button>`;
    toggleSections(true);
    await loadCredits(u.uid);
  } else {
    nav.innerHTML=`<button onclick="login()">Log In / Register</button>`;
    toggleSections(false);
  }
});

// Login/Register
function login(){
  const e=prompt("Email"), p=prompt("Password");
  auth.signInWithEmailAndPassword(e,p).catch(()=>{
    auth.createUserWithEmailAndPassword(e,p).catch(err=>alert(err.message));
  });
}

function logout(){auth.signOut();}
function resetPassword(){
  const e=prompt("Email:");
  auth.sendPasswordResetEmail(e).then(()=>alert("Reset sent")).catch(err=>alert(err.message));
}

let guestUsed=false;
document.getElementById('use-ai-guest').onclick=()=>{
  if(!guestUsed){demoAI(); guestUsed=true;} else alert("Please log in or buy credits.");
};

function toggleSections(ok){
  document.getElementById('preview').style.display=ok?'none':'block';
  document.getElementById('members-only').style.display=ok?'block':'none';
}

let userCredits=0;
async function loadCredits(uid){
  const doc=await db.collection('users').doc(uid).get();
  const data=doc.exists?doc.data():{credits:0};
  userCredits=data.credits;
  document.getElementById('credits-left').innerText=`Credits: ${userCredits}`;
}

function demoAI(){document.getElementById('ai-output').innerText="[Demo AI output]";}

document.getElementById('buy-credits').onclick=async ()=>{
  const res=await fetch('/.netlify/functions/create-checkout',{headers:{Authorization:auth.currentUser.uid},method:'POST'});
  const {sessionId}=await res.json();
  stripe.redirectToCheckout({sessionId});
};

document.getElementById('generate-ai').onclick=async ()=>{
  if(!auth.currentUser||userCredits<1) return alert("Login and buy credits.");
  const prompt=document.getElementById('user-input').value;
  const r=await fetch('/.netlify/functions/generate-ai',{method:'POST',headers:{Authorization:auth.currentUser.uid},body:JSON.stringify({prompt})});
  const {result}=await r.json();
  document.getElementById('ai-output').innerText=result;
  userCredits--;
  await db.collection('users').doc(auth.currentUser.uid).set({credits:userCredits,purchasedProducts: firebase.firestore.FieldValue.arrayUnion()});
  document.getElementById('credits-left').innerText=`Credits: ${userCredits}`;
};