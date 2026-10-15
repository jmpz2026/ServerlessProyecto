const LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_URL = LOCAL
  ? "http://localhost:8080/api/correo"
  : "https://tu-backend.onrender.com/api/correo";

const formulario = document.getElementById("formulario");
const campoCorreo = document.getElementById("correo");
const mensaje = document.getElementById("mensaje");

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensaje.textContent = "";

  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correo: campoCorreo.value })
    });

    const datos = await respuesta.json();
    mensaje.textContent = datos.mensaje;
    mensaje.style.color = datos.exito ? "green" : "red";
  } catch (error) {
    mensaje.textContent = "No se pudo conectar con el servidor";
    mensaje.style.color = "red";
  }
});
