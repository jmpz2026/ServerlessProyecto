package com.machitos.serverlessproyecto.service;

import com.machitos.serverlessproyecto.dto.CorreoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class WorkerClient {

    private final RestClient restClient;
    private final String workerUrl;

    public WorkerClient(RestClient.Builder builder, @Value("${worker.url}") String workerUrl) {
        if (workerUrl == null || workerUrl.isBlank()) {
            throw new IllegalStateException(
                    "worker.url esta vacia: configura WORKER_URL con la URL del Worker de Cloudflare");
        }
        String url = workerUrl.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new IllegalStateException(
                    "worker.url debe ser una URL absoluta, por ejemplo https://serverless-proyecto.<subdominio>.workers.dev");
        }
        this.workerUrl = url;
        this.restClient = builder.build();
    }

    public CorreoResponse enviar(String correo) {
        return restClient.post()
                .uri(workerUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("correo", correo))
                .exchange((request, response) -> {
                    CorreoResponse cuerpo = response.bodyTo(CorreoResponse.class);
                    if (cuerpo == null) {
                        return new CorreoResponse(false, "Respuesta invalida del servicio de correo");
                    }
                    return cuerpo;
                });
    }
}
