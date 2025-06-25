firebase.initializeApp({
  apiKey: "AIzaSyAft96BSElFYyLkIVDxaiS2k8us9h1EPPw",
  authDomain: "etsy-templates.firebaseapp.com",
  projectId: "etsy-templates"
});

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(async (user) => {
  if (!user) return location = 'index.html';

  document.getElementById("user-email").innerText = user.email;
  document.getElementById("nav-user").innerHTML = `<button onclick="auth.signOut()">Logout</button>`;

  const doc = await db.collection("users").doc(user.uid).get();
  const data = doc.exists ? doc.data() : { credits: 0, purchasedProducts: [] };

  document.getElementById("dashboard-credits").innerText = data.credits || 0;

  const downloads = (data.purchasedProducts || []).map(
    id => `<div><a href="downloads/${id}.zip" download>${id}</a></div>`
  ).join('');
  document.getElementById("downloads").innerHTML = downloads;

  document.getElementById("dash-buy-credits").onclick = () => {
    alert("Credit purchasing requires backend functionality. Please visit your dashboard on Netlify-hosted version.");
  };
});
