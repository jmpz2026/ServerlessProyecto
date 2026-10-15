package com.machitos.serverlessproyecto.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] origenes;

    public CorsConfig(@Value("${cors.origenes}") String origenes) {
        this.origenes = origenes.split(",");
        for (int i = 0; i < this.origenes.length; i++) {
            this.origenes[i] = this.origenes[i].trim();
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(origenes)
                .allowedMethods("POST", "OPTIONS")
                .allowedHeaders("*");
    }
}
