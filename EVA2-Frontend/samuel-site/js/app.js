/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  app.js — Gestión de Colaboradores                          ║
 * ║  Los Días de Samuel                                         ║
 * ║                                                              ║
 * ║  CONCEPTOS APLICADOS:                                        ║
 * ║  • Arreglo de objetos como fuente de datos                   ║
 * ║  • Funciones modulares y reutilizables                       ║
 * ║  • Validación avanzada con Expresiones Regulares             ║
 * ║  • Sanitización de entrada (prevención XSS)                  ║
 * ║  • Manipulación segura del DOM (createElement / textContent) ║
 * ║  • CRUD completo: Crear, Leer, Actualizar, Eliminar          ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict'; // Activar modo estricto para mayor seguridad

/* ════════════════════════════════════════════
   1. ESTADO GLOBAL DE LA APLICACIÓN
   ════════════════════════════════════════════ */

/**
 * @type {Array<Object>} colaboradores — Arreglo de objetos principal.
 * Cada objeto representa un colaborador registrado.
 * Estructura: { id, nombre, email, telefono, rol, mensaje, fecha }
 */
let colaboradores = [];

/**
 * @type {number|null} modoEdicion — ID del colaborador en edición, o null.
 */
let modoEdicion = null;

/* ════════════════════════════════════════════
   2. EXPRESIONES REGULARES (VALIDACIÓN)
   ════════════════════════════════════════════ */

const REGEX = {
  // Nombre: 2–60 chars, solo letras (incluye tildes), espacios y guiones
  nombre:   /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-]{2,60}$/,
  // Email: formato estándar RFC-5322 simplificado
  email:    /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  // Teléfono: acepta formato chileno u internacional (+56 9 XXXX XXXX o similar)
  telefono: /^(\+?56\s?)?(\d[\s\-]?){7,12}$/,
};

/* ════════════════════════════════════════════
   3. MÓDULO DE SEGURIDAD — SANITIZACIÓN XSS
   ════════════════════════════════════════════ */

/**
 * sanitizarTexto — Elimina caracteres peligrosos para prevenir XSS.
 * NUNCA se usa innerHTML con datos del usuario; siempre textContent.
 *
 * @param {string} str — Texto crudo ingresado por el usuario
 * @returns {string} — Texto limpio y seguro
 */
function sanitizarTexto(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    // Eliminar etiquetas HTML potencialmente inyectadas
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Eliminar comillas que podrían romper atributos
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Eliminar backticks (template injection)
    .replace(/`/g, '&#x60;')
    // Eliminar caracteres de control Unicode peligrosos
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

/**
 * escaparParaMostrar — Convierte entidades de vuelta para mostrar en UI.
 * Usado sólo al leer de la fuente de datos y mostrar vía textContent.
 *
 * @param {string} str
 * @returns {string}
 */
function escaparParaMostrar(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x60;/g, '`');
}

/* ════════════════════════════════════════════
   4. MÓDULO DE VALIDACIÓN
   ════════════════════════════════════════════ */

/**
 * validarCampo — Valida un campo individual y muestra/oculta el error.
 *
 * @param {string} idInput  — ID del elemento <input> o <select>
 * @param {string} idError  — ID del <span> donde mostrar el error
 * @param {RegExp|null} regex — Expresión regular (null para no validar formato)
 * @param {string} mensajeError — Texto del error a mostrar
 * @returns {boolean} — true si el campo es válido
 */
function validarCampo(idInput, idError, regex, mensajeError) {
  const input = document.getElementById(idInput);
  const errorEl = document.getElementById(idError);
  const valor = input.value.trim();

  // 1. Campo vacío (siempre obligatorio)
  if (valor === '' || valor === null || valor === undefined) {
    mostrarErrorCampo(input, errorEl, 'Este campo es obligatorio.');
    return false;
  }

  // 2. Validación de formato con regex (si se pasa)
  if (regex && !regex.test(valor)) {
    mostrarErrorCampo(input, errorEl, mensajeError);
    return false;
  }

  // 3. Campo válido
  limpiarErrorCampo(input, errorEl);
  return true;
}

/**
 * mostrarErrorCampo — Aplica estado de error visual a un campo.
 *
 * @param {HTMLElement} input
 * @param {HTMLElement} errorEl
 * @param {string} mensaje
 */
function mostrarErrorCampo(input, errorEl, mensaje) {
  input.classList.add('input-error');
  input.classList.remove('input-ok');
  // Seguro: textContent, no innerHTML
  errorEl.textContent = mensaje;
  errorEl.classList.add('visible');
  input.setAttribute('aria-invalid', 'true');
}

/**
 * limpiarErrorCampo — Limpia el estado de error de un campo.
 *
 * @param {HTMLElement} input
 * @param {HTMLElement} errorEl
 */
function limpiarErrorCampo(input, errorEl) {
  input.classList.remove('input-error');
  input.classList.add('input-ok');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
  input.setAttribute('aria-invalid', 'false');
}

/**
 * validarFormulario — Ejecuta todas las validaciones del formulario.
 *
 * @returns {boolean} — true si todo es válido
 */
function validarFormulario() {
  const v1 = validarCampo(
    'f-nombre', 'err-nombre',
    REGEX.nombre,
    'Solo letras y espacios, mínimo 2 caracteres.'
  );
  const v2 = validarCampo(
    'f-email', 'err-email',
    REGEX.email,
    'Formato de correo no válido (ej: usuario@correo.com).'
  );
  const v3 = validarCampo(
    'f-telefono', 'err-telefono',
    REGEX.telefono,
    'Formato inválido. Ej: +56 9 1234 5678 o 987654321.'
  );
  const v4 = validarCampo(
    'f-rol', 'err-rol',
    null,
    ''
  );
  return v1 && v2 && v3 && v4;
}

/* ════════════════════════════════════════════
   5. MÓDULO DE DATOS — CRUD CON ARREGLO
   ════════════════════════════════════════════ */

/**
 * generarId — Crea un ID único basado en timestamp + random.
 *
 * @returns {number}
 */
function generarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * agregarColaborador — Crea un nuevo objeto y lo agrega al arreglo.
 *
 * @param {Object} datos — Datos crudos del formulario
 */
function agregarColaborador(datos) {
  const nuevoColaborador = {
    id:       generarId(),
    nombre:   sanitizarTexto(datos.nombre),
    email:    sanitizarTexto(datos.email),
    telefono: sanitizarTexto(datos.telefono),
    rol:      sanitizarTexto(datos.rol),
    mensaje:  sanitizarTexto(datos.mensaje),
    fecha:    new Date().toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' }),
  };
  colaboradores.push(nuevoColaborador); // Agregar al arreglo principal
  guardarEnStorage();
}

/**
 * actualizarColaborador — Actualiza un objeto existente en el arreglo.
 *
 * @param {number} id     — ID del colaborador a actualizar
 * @param {Object} datos  — Nuevos datos del formulario
 */
function actualizarColaborador(id, datos) {
  // Usar map para retornar un nuevo arreglo con el item modificado (inmutabilidad)
  colaboradores = colaboradores.map(colab => {
    if (colab.id === id) {
      return {
        ...colab, // Conservar propiedades no editadas (ej: fecha)
        nombre:   sanitizarTexto(datos.nombre),
        email:    sanitizarTexto(datos.email),
        telefono: sanitizarTexto(datos.telefono),
        rol:      sanitizarTexto(datos.rol),
        mensaje:  sanitizarTexto(datos.mensaje),
        editado:  new Date().toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' }),
      };
    }
    return colab;
  });
  guardarEnStorage();
}

/**
 * eliminarColaborador — Filtra el arreglo para remover un colaborador.
 *
 * @param {number} id — ID del colaborador a eliminar
 */
function eliminarColaborador(id) {
  colaboradores = colaboradores.filter(colab => colab.id !== id);
  guardarEnStorage();
}

/**
 * obtenerDatosFormulario — Lee y retorna los valores actuales del formulario.
 *
 * @returns {Object}
 */
function obtenerDatosFormulario() {
  return {
    nombre:   document.getElementById('f-nombre').value,
    email:    document.getElementById('f-email').value,
    telefono: document.getElementById('f-telefono').value,
    rol:      document.getElementById('f-rol').value,
    mensaje:  document.getElementById('f-mensaje').value,
  };
}

/**
 * limpiarFormulario — Resetea todos los campos del formulario.
 */
function limpiarFormulario() {
  ['f-nombre','f-email','f-telefono','f-rol','f-mensaje'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.classList.remove('input-error','input-ok');
    el.setAttribute('aria-invalid', 'false');
  });
  ['err-nombre','err-email','err-telefono','err-rol'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.classList.remove('visible');
  });
  document.getElementById('char-count').textContent = '0 / 300';
  ocultarAlerta();
}

/* ════════════════════════════════════════════
   6. MÓDULO DE PERSISTENCIA — localStorage
   ════════════════════════════════════════════ */

const STORAGE_KEY = 'samuel_colaboradores';

/**
 * guardarEnStorage — Persiste el arreglo como JSON en localStorage.
 */
function guardarEnStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colaboradores));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e.message);
  }
}

/**
 * cargarDesdeStorage — Recupera y parsea los datos al iniciar la app.
 */
function cargarDesdeStorage() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    if (datos) {
      const parsed = JSON.parse(datos);
      // Verificar que sea un arreglo válido
      if (Array.isArray(parsed)) {
        colaboradores = parsed;
      }
    }
  } catch (e) {
    console.warn('Error al leer localStorage:', e.message);
    colaboradores = [];
  }
}

/* ════════════════════════════════════════════
   7. MÓDULO DE RENDERIZADO (DOM)
   ════════════════════════════════════════════ */

/**
 * crearElementoColaborador — Construye un elemento DOM de forma segura.
 * IMPORTANTE: Se usa createElement y textContent, NUNCA innerHTML
 * con datos del usuario para prevenir ataques XSS.
 *
 * @param {Object} colab — Objeto colaborador
 * @returns {HTMLElement} — Elemento <div> listo para insertar
 */
function crearElementoColaborador(colab) {
  // Contenedor principal
  const item = document.createElement('div');
  item.classList.add('colab-item');
  item.dataset.id = colab.id; // Guardar ID en data-attribute

  // Avatar con iniciales
  const avatar = document.createElement('div');
  avatar.classList.add('colab-avatar');
  const nombre = escaparParaMostrar(colab.nombre);
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map(p => p[0] || '')
    .join('')
    .toUpperCase();
  avatar.textContent = iniciales; // textContent: seguro

  // Bloque de información
  const info = document.createElement('div');
  info.classList.add('colab-info');

  const nombreEl = document.createElement('div');
  nombreEl.classList.add('colab-name');
  nombreEl.textContent = escaparParaMostrar(colab.nombre); // SEGURO

  const badge = document.createElement('span');
  badge.classList.add('colab-badge');
  badge.textContent = escaparParaMostrar(colab.rol); // SEGURO

  info.appendChild(nombreEl);
  info.appendChild(badge);

  // Mensaje opcional
  if (colab.mensaje && colab.mensaje.trim() !== '') {
    const msgEl = document.createElement('div');
    msgEl.classList.add('colab-msg');
    // Truncar si es muy largo para la vista
    const msgTexto = escaparParaMostrar(colab.mensaje);
    msgEl.textContent = msgTexto.length > 80
      ? msgTexto.substring(0, 80) + '…'
      : msgTexto; // SEGURO
    info.appendChild(msgEl);
  }

  // Acciones (editar / eliminar)
  const acciones = document.createElement('div');
  acciones.classList.add('colab-actions');

  const btnEditar = document.createElement('button');
  btnEditar.classList.add('colab-btn', 'edit');
  btnEditar.title = 'Editar colaborador';
  btnEditar.setAttribute('aria-label', `Editar a ${escaparParaMostrar(colab.nombre)}`);
  btnEditar.dataset.action = 'edit';
  btnEditar.dataset.id = colab.id;
  const editIcon = document.createElement('i');
  editIcon.className = 'fa-solid fa-pen';
  btnEditar.appendChild(editIcon);

  const btnEliminar = document.createElement('button');
  btnEliminar.classList.add('colab-btn', 'del');
  btnEliminar.title = 'Eliminar colaborador';
  btnEliminar.setAttribute('aria-label', `Eliminar a ${escaparParaMostrar(colab.nombre)}`);
  btnEliminar.dataset.action = 'delete';
  btnEliminar.dataset.id = colab.id;
  const delIcon = document.createElement('i');
  delIcon.className = 'fa-solid fa-trash';
  btnEliminar.appendChild(delIcon);

  acciones.appendChild(btnEditar);
  acciones.appendChild(btnEliminar);

  // Ensamblar item
  item.appendChild(avatar);
  item.appendChild(info);
  item.appendChild(acciones);

  return item;
}

/**
 * renderizarLista — Vuelve a dibujar la lista completa desde el arreglo.
 * Función central del módulo de renderizado.
 *
 * @param {Array<Object>} lista — Subconjunto del arreglo a mostrar
 */
function renderizarLista(lista) {
  const contenedor = document.getElementById('lista-colaboradores');
  const emptyMsg   = document.getElementById('lista-empty');
  const footer     = document.getElementById('list-footer');
  const countBadge = document.getElementById('list-count');

  // Limpiar el contenedor de forma segura (no innerHTML = '')
  while (contenedor.firstChild) {
    contenedor.removeChild(contenedor.firstChild);
  }

  // Actualizar contador
  countBadge.textContent = colaboradores.length;

  if (lista.length === 0) {
    // Mostrar estado vacío
    const empty = document.getElementById('lista-empty') || crearEstadoVacio();
    contenedor.appendChild(empty);
    emptyMsg.style.display = 'flex';
    footer.style.display = 'none';
    return;
  }

  emptyMsg.style.display = 'none';
  footer.style.display   = 'flex';

  // Usar DocumentFragment para mejor eficiencia en el renderizado
  const fragment = document.createDocumentFragment();

  // Renderizar cada colaborador con createElement
  lista.forEach(colab => {
    const el = crearElementoColaborador(colab);
    fragment.appendChild(el);
  });
  
  contenedor.appendChild(fragment);

  // Info de filtrado
  const filterInfo = document.getElementById('filter-info');
  if (lista.length < colaboradores.length) {
    filterInfo.textContent = `Mostrando ${lista.length} de ${colaboradores.length}`;
  } else {
    filterInfo.textContent = `${colaboradores.length} colaborador${colaboradores.length !== 1 ? 'es' : ''}`;
  }
}

/* ════════════════════════════════════════════
   8. MÓDULO DE FILTRADO Y BÚSQUEDA
   ════════════════════════════════════════════ */

/**
 * filtrarLista — Filtra colaboradores por texto y/o rol.
 * Se llama en cada evento oninput / onchange del buscador.
 */
function filtrarLista() {
  const textoBusqueda = document.getElementById('search-input').value.trim().toLowerCase();
  const rolFiltro     = document.getElementById('filter-rol').value;
  const sortFiltro    = document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'recientes';

  // Usar .filter() sobre el arreglo principal
  let resultado = colaboradores.filter(colab => {
    const coincideTexto = textoBusqueda === '' ||
      escaparParaMostrar(colab.nombre).toLowerCase().includes(textoBusqueda) ||
      escaparParaMostrar(colab.email).toLowerCase().includes(textoBusqueda) ||
      escaparParaMostrar(colab.rol).toLowerCase().includes(textoBusqueda);

    const coincideRol = rolFiltro === '' ||
      escaparParaMostrar(colab.rol) === rolFiltro;

    return coincideTexto && coincideRol;
  });

  // Aplicar ordenamiento
  resultado.sort((a, b) => {
    switch (sortFiltro) {
      case 'antiguos': return a.id - b.id;
      case 'az': return a.nombre.localeCompare(b.nombre);
      case 'za': return b.nombre.localeCompare(a.nombre);
      case 'recientes':
      default: return b.id - a.id;
    }
  });

  renderizarLista(resultado);
}

/* ════════════════════════════════════════════
   9. MÓDULO DE ALERTAS Y FEEDBACK
   ════════════════════════════════════════════ */

/**
 * mostrarAlerta — Muestra un mensaje de éxito o error en el formulario.
 *
 * @param {string} mensaje
 * @param {'success'|'error'} tipo
 */
function mostrarAlerta(mensaje, tipo) {
  const alertEl = document.getElementById('form-alert');
  alertEl.className = `form-alert show ${tipo}`;
  // Construir contenido de la alerta con createElement (no innerHTML)
  while (alertEl.firstChild) alertEl.removeChild(alertEl.firstChild);
  const icon = document.createElement('i');
  icon.className = tipo === 'success'
    ? 'fa-solid fa-circle-check'
    : 'fa-solid fa-triangle-exclamation';
  const texto = document.createElement('span');
  texto.textContent = mensaje; // SEGURO
  alertEl.appendChild(icon);
  alertEl.appendChild(texto);

  // Auto-ocultar tras 4 segundos
  setTimeout(ocultarAlerta, 4000);
}

/**
 * ocultarAlerta — Oculta el banner de alerta.
 */
function ocultarAlerta() {
  const alertEl = document.getElementById('form-alert');
  alertEl.className = 'form-alert';
  while (alertEl.firstChild) alertEl.removeChild(alertEl.firstChild);
}

/* ════════════════════════════════════════════
   10. CONTROLADORES DE ACCIONES (CRUD UI)
   ════════════════════════════════════════════ */

/**
 * manejarSubmit — Controlador principal del botón de envío.
 * Decide si crear o actualizar según el modo actual.
 */
function manejarSubmit() {
  ocultarAlerta();

  // Ejecutar todas las validaciones
  const esValido = validarFormulario();
  if (!esValido) {
    mostrarAlerta('Por favor, corrige los errores indicados.', 'error');
    return;
  }

  const datos = obtenerDatosFormulario();

  if (modoEdicion !== null) {
    // Modo edición: actualizar objeto en el arreglo
    actualizarColaborador(modoEdicion, datos);
    mostrarAlerta(`✓ Colaborador "${sanitizarTexto(datos.nombre)}" actualizado.`, 'success');
    cancelarEdicion();
  } else {
    // Modo creación: agregar nuevo objeto al arreglo
    agregarColaborador(datos);
    const nombreMostrar = sanitizarTexto(datos.nombre);
    mostrarAlerta(`✓ ¡${nombreMostrar} fue registrado exitosamente!`, 'success');
    limpiarFormulario();
  }

  filtrarLista(); // Re-renderizar respetando filtros activos
}

/**
 * iniciarEdicion — Carga los datos de un colaborador al formulario para editar.
 *
 * @param {number} id — ID del colaborador
 */
function iniciarEdicion(id) {
  // Buscar en el arreglo por ID (find retorna el objeto o undefined)
  const colab = colaboradores.find(c => c.id === id);
  if (!colab) return;

  modoEdicion = id;

  // Cargar datos de forma segura (textContent interno no es XSS aquí, pero
  // igualmente se usa escaparParaMostrar para coherencia)
  document.getElementById('f-nombre').value   = escaparParaMostrar(colab.nombre);
  document.getElementById('f-email').value    = escaparParaMostrar(colab.email);
  document.getElementById('f-telefono').value = escaparParaMostrar(colab.telefono);
  document.getElementById('f-rol').value      = escaparParaMostrar(colab.rol);
  document.getElementById('f-mensaje').value  = escaparParaMostrar(colab.mensaje);
  actualizarContadorChars();

  // Cambiar UI a modo edición
  document.getElementById('form-mode-label').textContent = 'Editando Colaborador';
  document.getElementById('btn-submit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
  document.getElementById('btn-cancel').classList.remove('hidden');

  // Scroll suave al formulario
  document.getElementById('gestion').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * cancelarEdicion — Descarta la edición y vuelve al modo creación.
 */
function cancelarEdicion() {
  modoEdicion = null;
  limpiarFormulario();
  document.getElementById('form-mode-label').textContent = 'Nuevo Colaborador';
  document.getElementById('btn-submit').innerHTML = '<i class="fa-solid fa-paper-plane"></i> Registrar Colaborador';
  document.getElementById('btn-cancel').classList.add('hidden');
}

/**
 * confirmarEliminar — Solicita confirmación y elimina si se acepta.
 *
 * @param {number} id
 */
function confirmarEliminar(id) {
  const colab = colaboradores.find(c => c.id === id);
  if (!colab) return;

  // Confirmación nativa del navegador (simple y segura)
  const nombre = escaparParaMostrar(colab.nombre);
  const confirmar = window.confirm(`¿Estás seguro de eliminar a "${nombre}"?\nEsta acción no se puede deshacer.`);
  if (!confirmar) return;

  // Animación de salida antes de remover del DOM
  const itemEl = document.querySelector(`.colab-item[data-id="${id}"]`);
  if (itemEl) {
    itemEl.classList.add('removing');
    setTimeout(() => {
      eliminarColaborador(id);
      filtrarLista();
    }, 280);
  } else {
    eliminarColaborador(id);
    filtrarLista();
  }
}

/**
 * eliminarTodos — Vacía el arreglo completo previa confirmación.
 */
function eliminarTodos() {
  if (colaboradores.length === 0) return;
  const confirmar = window.confirm(`¿Eliminar los ${colaboradores.length} colaboradores registrados?\nEsta acción es permanente.`);
  if (!confirmar) return;
  colaboradores = [];
  guardarEnStorage();
  cancelarEdicion();
  filtrarLista();
}

/* ════════════════════════════════════════════
   11. CONTADOR DE CARACTERES (UX)
   ════════════════════════════════════════════ */

/**
 * actualizarContadorChars — Muestra cuántos chars quedan en el textarea.
 */
function actualizarContadorChars() {
  const textarea = document.getElementById('f-mensaje');
  const counter  = document.getElementById('char-count');
  const actual   = textarea.value.length;
  const max      = parseInt(textarea.getAttribute('maxlength'), 10) || 300;
  // textContent: seguro
  counter.textContent = `${actual} / ${max}`;
  counter.style.color = actual >= max * 0.9 ? '#fbbf24' : '';
}

/* ════════════════════════════════════════════
   12. INICIALIZACIÓN
   ════════════════════════════════════════════ */

/**
 * inicializar — Punto de entrada de la aplicación.
 * Se ejecuta cuando el DOM está completamente cargado.
 */
function inicializar() {
  // 1. Cargar datos persistidos
  cargarDesdeStorage();

  // 2. Renderizar lista inicial aplicando filtros/orden
  filtrarLista();

  // 3. Delegación de Eventos (Event Delegation) para la lista
  const listaContenedor = document.getElementById('lista-colaboradores');
  if (listaContenedor) {
    listaContenedor.addEventListener('click', (e) => {
      const btn = e.target.closest('.colab-btn');
      if (!btn) return; // Si no se hizo click en un botón, ignorar
      
      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id, 10);
      
      if (action === 'edit') iniciarEdicion(id);
      if (action === 'delete') confirmarEliminar(id);
    });
  }

  // 3. Listener para contador de chars del textarea
  const textarea = document.getElementById('f-mensaje');
  if (textarea) {
    textarea.addEventListener('input', actualizarContadorChars);
  }

  // 4. Validación en tiempo real al salir de cada campo (blur)
  const camposValidar = [
    { id: 'f-nombre',   errId: 'err-nombre',   regex: REGEX.nombre,   msg: 'Solo letras y espacios, mínimo 2 caracteres.' },
    { id: 'f-email',    errId: 'err-email',     regex: REGEX.email,    msg: 'Formato inválido (ej: usuario@correo.com).' },
    { id: 'f-telefono', errId: 'err-telefono',  regex: REGEX.telefono, msg: 'Formato inválido. Ej: +56 9 1234 5678.' },
  ];

  camposValidar.forEach(({ id, errId, regex, msg }) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => validarCampo(id, errId, regex, msg));
    // Limpiar error al escribir
    input.addEventListener('input', () => {
      if (input.classList.contains('input-error')) {
        limpiarErrorCampo(input, document.getElementById(errId));
      }
    });
  });

  console.info('%c[Samuel App] Inicializado correctamente.', 'color:#38bdf8;font-weight:bold;');
  console.info('%cColaboradores cargados:', 'color:#7dd3fc', colaboradores.length);
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);
