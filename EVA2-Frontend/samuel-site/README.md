# Los Días de Samuel — Sitio Web Oficial v2

## 📁 Estructura del Proyecto (Se utilizo el proyecto anterior EVA 1.)

```
samuel-site/
├── index.html              ← Página principal (abrir en navegador)
├── css/
│   └── styles.css          ← Estilos completos (glassmorphism, responsive)
├── js/
│   ├── main.js             ← Scripts generales (reveal, contacto)
│   └── app.js              ← Aplicación de gestión (JS avanzado)
├── img/
│   └── LEEME.txt           ← Instrucciones para imagen de fondo
└── README.md               ← Este archivo
```

## 🚀 Cómo usar

1. Descomprime el ZIP
2. (Opcional) Agrega `flowers.jpg` a la carpeta `img/` "Era para poner una imagen"
3. Abre `index.html` en tu navegador — ¡Funciona sin servidor!

---

## 📋 Requisitos Académicos Cumplidos

### ✅ Formulario con 3+ campos y validaciones avanzadas
- **Texto**: Nombre completo → Regex `/^[a-zA-Záéíóú...]{2,60}$/`
- **Email**: → Regex RFC-5322 simplificado
- **Número**: Teléfono → Regex para formato chileno/internacional
- **Select**: Rol de colaboración (obligatorio)
- **Textarea**: Mensaje (opcional, con contador de chars)

Todas las validaciones se ejecutan en `blur` (al salir del campo)
y también al intentar enviar, con mensajes de error individuales.

### ✅ Manipulación del DOM (mostrar / actualizar / eliminar)
- `renderizarLista(lista)` → Reconstruye la lista desde cero
- Cada item tiene botones de **editar** y **eliminar**
- Animaciones de entrada/salida con CSS
- Buscador en tiempo real (oninput) + filtro por rol (onchange)
- Estado vacío con mensaje contextual

### ✅ Funciones modulares y reutilizables
| Función | Responsabilidad |
|---|---|
| `sanitizarTexto(str)` | Prevención XSS |
| `escaparParaMostrar(str)` | Decodifica entidades para UI |
| `validarCampo(...)` | Valida un campo individual |
| `validarFormulario()` | Orquesta todas las validaciones |
| `agregarColaborador(datos)` | Crea y agrega objeto al arreglo |
| `actualizarColaborador(id, datos)` | Modifica con map() |
| `eliminarColaborador(id)` | Filtra con filter() |
| `crearElementoColaborador(colab)` | Construye DOM seguro |
| `renderizarLista(lista)` | Renderiza/actualiza la vista |
| `filtrarLista()` | Filtra con .filter() |
| `mostrarAlerta(msg, tipo)` | Feedback al usuario |
| `guardarEnStorage()` | Persiste en localStorage |
| `cargarDesdeStorage()` | Recupera datos al iniciar |
| `inicializar()` | Punto de entrada de la app |

### ✅ Buenas prácticas de seguridad (Anti-XSS)
- **NUNCA** se usa `innerHTML` con datos del usuario
- Se utiliza `textContent` y `createElement` para todo el DOM dinámico
- `sanitizarTexto()` escapa: `<`, `>`, `"`, `'`, `` ` `` y caracteres de control
- `escaparParaMostrar()` revierte solo para mostrar via `textContent`
- Modo estricto activado: `'use strict'`
- IDs de botones pasados por closure (no por string interpolado en HTML)

---

## 🤖 Informe de Uso de Inteligencia Artificial

### Herramienta utilizada
**Claude Sonnet** (Anthropic) — Asistente de IA conversacional.
**Gemini 3 Pro** (Google) — Asistente de IA conversacional.
**Antigravity** (Google) — Plataforma de Desarrollo Agéntico con IA.

### ¿Cómo se usó?

**1. Generación inicial del sitio web**
Se le proporcionó a Claude un brief detallado con:
- Paleta de colores (sky blue + glassmorphism)
- Secciones requeridas (hero, capítulos, social, sinopsis, T2, contacto)
- Requerimientos de responsividad

Claude generó el HTML5 semántico, CSS3 y JS base en una sola respuesta.

**2. Implementación del módulo académico (app.js)**
Se le solicitó a Claude añadir una aplicación de gestión de colaboradores
Claude:
- Estructuró el código en módulos con separación de responsabilidades
- Propuso el patrón de sanitización XSS con `sanitizarTexto()`
- Eligió `createElement + textContent` sobre `innerHTML` por seguridad
- Diseñó las regex para los 3 tipos de validación requeridos
- Implementó persistencia con localStorage

**3. Documentación**
Claude generó los comentarios JSDoc de cada función y este README.

### Validación y ajustes realizados
- Se verificó que todas las funciones fueran realmente modulares
- Se comprobó que no existieran usos de `innerHTML` con datos de usuario
- Se validó que el formulario rechaza intentos de inyección (ej: `<script>alert(1)</script>`)
- Se revisó que `'use strict'` estuviera activo

### Limitaciones del uso de IA
- La IA no tiene acceso al navegador para probar en tiempo real
- La IA no conoce el contexto escolar específico sin que se le indique
- El código fue revisado y validado por el equipo humano antes de entregar

### Evidencia de apoyo con IA

A lo largo del desarrollo de este proyecto, se utilizó Inteligencia Artificial como asistente de programación para resolver problemas complejos y mejorar la calidad del código. A continuación, se detallan tres casos específicos de su uso:

**Caso 1: Generación de validaciones complejas (Expresiones Regulares)**
*   **Prompt utilizado:** *"Necesito validar un formulario de registro en JavaScript. Genera expresiones regulares (regex) precisas para validar: 1) Un nombre completo (solo letras, tildes y espacios, de 2 a 60 caracteres). 2) Un correo electrónico estándar. 3) Un número de teléfono que acepte formato chileno u optativo internacional (con o sin +56 9). Explica brevemente cómo implementarlas."*
*   **Mejora aplicada:** La IA generó un diccionario de variables `REGEX` exactas que fueron integradas en el módulo de validación del archivo `app.js`. Esto permitió delegar la lógica compleja de coincidencia de patrones a la IA, asegurando que los datos almacenados (email y teléfono) tengan siempre un formato íntegro y libre de errores humanos.

**Caso 2: Prevención de vulnerabilidades y sugerencias de estructura (XSS)**
*   **Prompt utilizado:** *"Tengo que leer los datos de un arreglo en JS y mostrarlos en el DOM mediante tarjetas HTML. Necesito que la estructura sea completamente segura y prevenga ataques de inyección de código (XSS). ¿Qué enfoque me sugieres usar en JavaScript puro en lugar del clásico 'innerHTML'?"*
*   **Mejora aplicada:** La IA recomendó cambiar radicalmente la estructura de renderizado. En lugar de concatenar *strings* de HTML, sugirió usar un enfoque basado en `document.createElement()` y la inyección de datos a través de `.textContent`. Además, aportó una función de apoyo (`sanitizarTexto()`) para limpiar las entradas del formulario. Esto elevó el estándar de seguridad de la aplicación a un nivel profesional.

**Caso 3: Refactorización de la lógica de renderizado y filtrado**
*   **Prompt utilizado:** *"Actualmente tengo mi lista de colaboradores, pero quiero agregar un buscador interactivo que filtre simultáneamente por el texto ingresado y por el rol seleccionado en un 'select'. ¿Cómo puedo refactorizar mi función de búsqueda para que sea lo más eficiente y limpia posible?"*
*   **Mejora aplicada:** La IA analizó el código e indicó una refactorización basada en métodos funcionales de arreglos. Sugirió utilizar `.filter()` evaluando constantes booleanas (`coincideTexto` y `coincideRol`) en lugar de hacer ciclos `for` anidados. Para optimizar el pintado en pantalla de los resultados filtrados, implementó el uso de un `DocumentFragment`, logrando que la aplicación sea más rápida y consuma menos memoria al actualizar el DOM.

---

Hecho con ❤️ para **@samuelcarrascoficial** — Proyecto Académico 2025
