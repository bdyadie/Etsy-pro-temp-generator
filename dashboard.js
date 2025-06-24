firebase.initializeApp({ apiKey:"...", authDomain:"...", projectId:"..." });
const auth=firebase.auth(), db=firebase.firestore(), stripe=Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");
auth.onAuthStateChanged(async u=>{
  if(!u) return location='index.html';
  document.getElementById('user-email').innerText=u.email;
  document.getElementById('nav-user').innerHTML=`<button onclick="auth.signOut()">Logout</button>`;
  const doc=await db.collection('users').doc(u.uid).get();
  const data=doc.exists?doc.data():{credits:0,purchasedProducts:[]};
  document.getElementById('dashboard-credits').innerText=data.credits;
  document.getElementById('downloads').innerHTML=data.purchasedProducts.map(id=>`<div><a href="downloads/${id}.zip" download>${id}</a></div>`).join('');
  document.getElementById('dash-buy-credits').onclick=()=>{
    fetch('/.netlify/functions/create-checkout',{method:'POST',headers:{Authorization:u.uid}})
      .then(r=>r.json()).then(d=>stripe.redirectToCheckout({sessionId:d.sessionId}));
  }
});