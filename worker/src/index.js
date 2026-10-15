const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

const ASUNTO = "Mensaje desde la aplicacion";
const CUERPO = "Este correo fue enviado desde el proyecto serverless.";

function responder(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function revisarConfiguracion(env) {
  if (!env.SENDGRID_API_KEY) {
    const malNombre = Object.keys(env).find((nombre) => nombre.startsWith("SG."));
    if (malNombre) {
      return "La API key de SendGrid quedo como NOMBRE de variable. El nombre debe ser SENDGRID_API_KEY y la key va en el VALOR.";
    }
    return "Falta el secreto SENDGRID_API_KEY en el Worker.";
  }
  if (!env.SENDGRID_API_KEY.startsWith("SG.")) {
    return "SENDGRID_API_KEY no parece una API key de SendGrid: debe empezar con SG.";
  }
  if (!env.FROM_EMAIL) {
    return "Falta la variable FROM_EMAIL con el remitente verificado en SendGrid.";
  }
  return null;
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

    const problema = revisarConfiguracion(env);
    if (problema) {
      return responder({ exito: false, mensaje: problema }, 500);
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
