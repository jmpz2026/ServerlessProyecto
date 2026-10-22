const API_URL = (window.CONFIG && window.CONFIG.apiUrl) || "http://localhost:8080/api/correo";

const formulario = document.getElementById("formulario");
const campoCorreo = document.getElementById("correo");
const campoAsunto = document.getElementById("asunto");
const campoCuerpo = document.getElementById("cuerpo");
const contador = document.getElementById("contador");
const boton = document.getElementById("boton");
const botonTexto = boton.querySelector(".boton-texto");
const mensaje = document.getElementById("mensaje");
const mensajeTexto = document.getElementById("mensaje-texto");

const validaciones = [
  { campo: campoCorreo, vacio: "El correo es obligatorio", invalido: "El correo no tiene un formato valido" },
  { campo: campoAsunto, vacio: "El asunto es obligatorio" },
  { campo: campoCuerpo, vacio: "El mensaje es obligatorio" }
];

function setCargando(cargando) {
  boton.disabled = cargando;
  boton.classList.toggle("cargando", cargando);
  botonTexto.textContent = cargando ? "Enviando..." : "Enviar";
}

function mostrarMensaje(texto, exito) {
  mensajeTexto.textContent = texto;
  mensaje.classList.toggle("alerta--exito", exito);
  mensaje.classList.toggle("alerta--error", !exito);
  mensaje.hidden = false;
}

function ocultarMensaje() {
  mensaje.hidden = true;
  mensajeTexto.textContent = "";
}

function actualizarContador() {
  contador.textContent = campoCuerpo.value.length + " / " + campoCuerpo.maxLength;
}

function validar() {
  for (const { campo, vacio, invalido } of validaciones) {
    const estaVacio = campo.value.trim() === "";
    if (estaVacio || !campo.checkValidity()) {
      campo.classList.add("invalido");
      campo.focus();
      return estaVacio ? vacio : invalido;
    }
  }
  return null;
}

for (const { campo } of validaciones) {
  campo.addEventListener("input", () => {
    campo.classList.remove("invalido");
  });
}

campoCuerpo.addEventListener("input", actualizarContador);

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultarMensaje();

  const error = validar();
  if (error) {
    mostrarMensaje(error, false);
    return;
  }

  setCargando(true);
  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        correo: campoCorreo.value.trim(),
        asunto: campoAsunto.value.trim(),
        mensaje: campoCuerpo.value.trim()
      })
    });

    let datos;
    try {
      datos = await respuesta.json();
    } catch (error) {
      mostrarMensaje("Respuesta inesperada del servidor (HTTP " + respuesta.status + ")", false);
      return;
    }

    mostrarMensaje(datos.mensaje || "Respuesta sin mensaje", Boolean(datos.exito));
    if (datos.exito) {
      formulario.reset();
      actualizarContador();
    }
  } catch (error) {
    mostrarMensaje("No se pudo conectar con el servidor", false);
  } finally {
    setCargando(false);
  }
});

actualizarContador();
