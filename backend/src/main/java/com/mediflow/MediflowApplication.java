package com.mediflow;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class MediflowApplication {

    @PostConstruct
    public void init() {
        // Set application timezone to Asia/Kolkata (IST UTC+5:30)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        SpringApplication.run(MediflowApplication.class, args);
    }
}
