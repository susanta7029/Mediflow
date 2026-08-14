package com.mediflow.controller;

import com.mediflow.dto.*;
import com.mediflow.entity.User;
import com.mediflow.security.SecurityUtils;
import com.mediflow.service.AuthService;
import com.mediflow.service.DoctorService;
import com.mediflow.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, JWT refresh token rotation, and profile recovery.")
public class AuthController {

    private final AuthService authService;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password to receive access & refresh tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account (PATIENT, DOCTOR, RECEPTIONIST, ADMIN)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and receive a new access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        User user = SecurityUtils.getCurrentUser();
        Long doctorId = null;
        Long patientId = null;
        if (user.getRole() == com.mediflow.entity.Role.DOCTOR) {
            doctorId = doctorService.getAllDoctors(null).stream()
                    .filter(d -> d.getUserId().equals(user.getId()))
                    .map(DoctorDto::getId).findFirst().orElse(null);
        } else if (user.getRole() == com.mediflow.entity.Role.PATIENT) {
            patientId = patientService.getPatientByUserId(user.getId()).getId();
        }

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .doctorId(doctorId)
                .patientId(patientId)
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.success(userDto));
    }
}
