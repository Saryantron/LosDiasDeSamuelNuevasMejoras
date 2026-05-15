/**
 * main.js — Scripts generales del sitio
 * Los Días de Samuel
 */

// ── Reveal on scroll ──────────────────────────
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

// ── Stagger chapter cards ─────────────────────
document.querySelectorAll('.chapters-grid .card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

// ── Formulario de contacto simple ────────────
function enviarContacto(e) {
  e.preventDefault(); // Evita recargar la página

  // Recopilar y sanitizar (usando la función de app.js)
  const nombreRaw = document.getElementById('c-nombre').value;
  const emailRaw = document.getElementById('c-email').value;
  const mensajeRaw = document.getElementById('c-mensaje').value;

  // Si no existe sanitizarTexto (ej. cargan scripts en distinto orden), usamos un fallback básico
  const clean = typeof sanitizarTexto === 'function' ? sanitizarTexto : (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const datosSeguros = {
    nombre: clean(nombreRaw),
    email: clean(emailRaw),
    mensaje: clean(mensajeRaw)
  };

  // Simular envío a backend
  console.log('Mensaje seguro a enviar:', datosSeguros);

  const btn = document.getElementById('btn-submit-contacto');
  const contenidoOriginal = btn.innerHTML;
  
  btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Mensaje enviado!';
  btn.style.background = 'linear-gradient(135deg,#059669,#34d399)';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = contenidoOriginal;
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset(); // Limpiar el formulario
  }, 3000);
}
