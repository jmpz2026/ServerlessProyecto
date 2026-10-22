const API_URL = (window.CONFIG && window.CONFIG.apiUrl) || "http://localhost:8080/api/correo";

const formulario = document.getElementById("formulario");
const campoCorreo = document.getElementById("correo");
const boton = document.getElementById("boton");
const botonTexto = boton.querySelector(".boton-texto");
const mensaje = document.getElementById("mensaje");
const mensajeTexto = document.getElementById("mensaje-texto");

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

campoCorreo.addEventListener("input", () => {
  campoCorreo.classList.remove("invalido");
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultarMensaje();

  if (!campoCorreo.checkValidity()) {
    campoCorreo.classList.add("invalido");
    const vacio = campoCorreo.value.trim() === "";
    mostrarMensaje(vacio ? "El correo es obligatorio" : "El correo no tiene un formato valido", false);
    campoCorreo.focus();
    return;
  }

  setCargando(true);
  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correo: campoCorreo.value.trim() })
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
    }
  } catch (error) {
    mostrarMensaje("No se pudo conectar con el servidor", false);
  } finally {
    setCargando(false);
  }
});
