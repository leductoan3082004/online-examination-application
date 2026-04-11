package com.examapp.dto.auth;

public record AuthResponse(String token, UserDto user) {
    public record UserDto(Long id, String name, String email, String role) {}
}
