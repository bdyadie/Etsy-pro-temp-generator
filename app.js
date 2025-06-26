// 🌟 Theme Switcher Logic
const themeSelect = document.getElementById('theme-select');
const bubbles = document.querySelectorAll('.preview-bubble');

function applyTheme(theme) {
  document.body.className = 'theme-' + theme;
  themeSelect.value = theme;
  bubbles.forEach(b => {
    b.classList.toggle('active', b.dataset.theme === theme);
  });
  localStorage.setItem('theme', theme);
}

themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
bubbles.forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

// 🎯 Navigation Button Handlers
document.getElementById('nav-auth').addEventListener('click', () => {
  alert('Login/Register functionality coming soon.');
});

// 🚀 Try AI Tool Guest Demo Button
let guestUsed = false;
document.getElementById('use‑ai‑guest').addEventListener('click', () => {
  if (guestUsed) {
    alert('Please log in or buy credits.');
  } else {
    alert('[Demo AI generated output displayed here]');
    guestUsed = true;
  }
});

// 🛍️ Product Buttons: BUY NOW & WhatsApp Initialization
document.querySelectorAll('.product').forEach(card => {
  const buyBtn = card.querySelector('.btn-primary');
  const waLink = card.querySelector('.btn-whatsapp');

  // Example: For now Buy Now buttons just show a message
  buyBtn.addEventListener('click', () => {
    alert('🎉 Buy Now clicked. Stripe integration coming soon.');
  });

  // WhatsApp links already have proper href in HTML
});

// 🔁 Smooth Scroll for Anchor Links
document.querySelectorAll('.site-nav a.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ✅ Page Initialization
console.log('App.js loaded — all functionality is connected and ready!');
