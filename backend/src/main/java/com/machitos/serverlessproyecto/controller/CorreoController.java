package com.machitos.serverlessproyecto.controller;

import com.machitos.serverlessproyecto.dto.CorreoRequest;
import com.machitos.serverlessproyecto.dto.CorreoResponse;
import com.machitos.serverlessproyecto.service.WorkerClient;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;

@RestController
@RequestMapping("/api/correo")
public class CorreoController {

    private final WorkerClient workerClient;

    public CorreoController(WorkerClient workerClient) {
        this.workerClient = workerClient;
    }

    @PostMapping
    public ResponseEntity<CorreoResponse> enviar(@Valid @RequestBody CorreoRequest request) {
        CorreoResponse respuesta = workerClient.enviar(request.getCorreo());
        if (respuesta.isExito()) {
            return ResponseEntity.ok(respuesta);
        }
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(respuesta);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CorreoResponse> validacion(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldError() != null
                ? ex.getBindingResult().getFieldError().getDefaultMessage()
                : "Datos invalidos";
        return ResponseEntity.badRequest().body(new CorreoResponse(false, mensaje));
    }

    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<CorreoResponse> falloWorker(RestClientException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new CorreoResponse(false, "No se pudo contactar el servicio de correo"));
    }
}
