package com.examapp.controller;

import com.examapp.config.SecurityConfig;
import com.examapp.dto.MessageResponse;
import com.examapp.dto.auth.AuthResponse;
import com.examapp.dto.auth.ChangePasswordRequest;
import com.examapp.dto.auth.LoginRequest;
import com.examapp.dto.auth.RegisterRequest;
import com.examapp.dto.auth.RegisterResponse;
import com.examapp.exception.DuplicateResourceException;
import com.examapp.exception.UnauthorizedException;
import com.examapp.security.JwtAuthenticationFilter;
import com.examapp.security.JwtUtil;
import com.examapp.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.io.IOException;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Autowired private WebApplicationContext webApplicationContext;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private AuthService authService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUpMockMvc() throws ServletException, IOException {
        // Compiler treats Mockito's .when(mock).doFilter(...) as invoking Filter.doFilter (checked exceptions).
        doAnswer(invocation -> {
            ServletRequest req = invocation.getArgument(0);
            ServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            try {
                chain.doFilter(req, res);
            } catch (ServletException | IOException e) {
                throw new RuntimeException(e);
            }
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());

        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void register_returnsCreated() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "password123");
        RegisterResponse response = new RegisterResponse(1L, "John", "john@test.com", "TEACHER");

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John"))
                .andExpect(jsonPath("$.role").value("TEACHER"));
    }

    @Test
    void register_duplicateEmail_returnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "password123");
        when(authService.register(any())).thenThrow(new DuplicateResourceException("Email already exists"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already exists"));
    }

    @Test
    void register_invalidEmail_returnsBadRequest() throws Exception {
        String json = """
                {"name": "John", "email": "not-an-email", "password": "password123"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_shortPassword_returnsBadRequest() throws Exception {
        String json = """
                {"name": "John", "email": "john@test.com", "password": "short"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_returnsToken() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "password123");
        AuthResponse response = new AuthResponse("jwt-token",
                new AuthResponse.UserDto(1L, "John", "john@test.com", "TEACHER"));

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.id").value(1));
    }

    @Test
    void login_invalidCredentials_returnsUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "wrong");
        when(authService.login(any())).thenThrow(new UnauthorizedException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void changePassword_returnsOk() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("password123", "newpassword1");
        when(authService.changePassword(eq(1L), any(ChangePasswordRequest.class)))
                .thenReturn(new MessageResponse("Password updated successfully"));

        var auth = new UsernamePasswordAuthenticationToken(
                1L, "token", List.of(new SimpleGrantedAuthority("ROLE_TEACHER")));

        mockMvc.perform(post("/api/auth/change-password")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated successfully"));
    }
}
