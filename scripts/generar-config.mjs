import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const apiUrl = process.env.API_URL || "http://localhost:8080/api/correo";

const destino = fileURLToPath(new URL("../frontend/config.js", import.meta.url));

writeFileSync(destino, "window.CONFIG = { apiUrl: " + JSON.stringify(apiUrl) + " };\n");

console.log("config.js generado con apiUrl = " + apiUrl);
