package com.mediflow;

import com.mediflow.dto.AuthRequest;
import com.mediflow.dto.AuthResponse;
import com.mediflow.entity.Role;
import com.mediflow.entity.User;
import com.mediflow.repository.DepartmentRepository;
import com.mediflow.repository.DoctorRepository;
import com.mediflow.repository.PatientRepository;
import com.mediflow.repository.RefreshTokenRepository;
import com.mediflow.repository.UserRepository;
import com.mediflow.security.JwtTokenProvider;
import com.mediflow.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("doctor@mediflow.com")
                .passwordHash("hashed_password")
                .firstName("Robert")
                .lastName("Chen")
                .role(Role.DOCTOR)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully authenticate user and return JWT tokens")
    void login_Success() {
        AuthRequest request = new AuthRequest();
        request.setEmail("doctor@mediflow.com");
        request.setPassword("Password123!");

        when(userRepository.findByEmail("doctor@mediflow.com")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateAccessToken(any(), any(), any())).thenReturn("mock_jwt_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getAccessToken());
        assertEquals("doctor@mediflow.com", response.getUser().getEmail());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
