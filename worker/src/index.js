const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

const ASUNTO = "Mensaje desde la aplicacion";
const CUERPO = "Este correo fue enviado desde el proyecto serverless.";

function responder(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return responder({ exito: false, mensaje: "Metodo no permitido" }, 405);
    }

    let datos;
    try {
      datos = await request.json();
    } catch (error) {
      return responder({ exito: false, mensaje: "Cuerpo JSON invalido" }, 400);
    }

    const correo = datos && typeof datos.correo === "string" ? datos.correo.trim() : "";
    if (correo === "") {
      return responder({ exito: false, mensaje: "El correo es obligatorio" }, 400);
    }

    if (!env.SENDGRID_API_KEY) {
      return responder({ exito: false, mensaje: "Falta la API key de SendGrid" }, 500);
    }

    const envio = {
      personalizations: [{ to: [{ email: correo }] }],
      from: { email: env.FROM_EMAIL },
      subject: ASUNTO,
      content: [{ type: "text/plain", value: CUERPO }]
    };

    let respuesta;
    try {
      respuesta = await fetch(SENDGRID_URL, {
        method: "POST",
        headers: {
          authorization: "Bearer " + env.SENDGRID_API_KEY,
          "content-type": "application/json"
        },
        body: JSON.stringify(envio)
      });
    } catch (error) {
      return responder({ exito: false, mensaje: "No se pudo contactar a SendGrid" }, 502);
    }

    if (respuesta.status === 202) {
      return responder({ exito: true, mensaje: "Correo enviado a " + correo }, 200);
    }

    const detalle = await respuesta.text();
    return responder(
      { exito: false, mensaje: "SendGrid rechazo el envio", detalle: detalle },
      502
    );
  }
};
