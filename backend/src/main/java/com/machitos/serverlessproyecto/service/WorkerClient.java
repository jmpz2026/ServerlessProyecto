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
        this.restClient = builder.build();
        this.workerUrl = workerUrl;
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
