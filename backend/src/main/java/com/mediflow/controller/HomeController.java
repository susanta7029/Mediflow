package com.mediflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "MEDIFLOW Healthcare Backend API");
        response.put("version", "1.0.0");
        response.put("message", "API server is running smoothly.");
        response.put("swaggerDocumentation", "/swagger-ui.html");
        return ResponseEntity.ok(response);
    }
}
