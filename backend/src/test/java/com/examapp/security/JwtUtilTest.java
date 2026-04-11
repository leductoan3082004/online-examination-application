package com.examapp.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        String secret = "Y29tLmV4YW1hcHAuc2VjcmV0LWtleS1mb3Itand0LXRva2VuLWdlbmVyYXRpb24tMjAyNg==";
        jwtUtil = new JwtUtil(secret, 86400000);
    }

    @Test
    void generateTeacherToken_returnsValidToken() {
        String token = jwtUtil.generateTeacherToken(1L, "test@test.com", "TEACHER");

        assertNotNull(token);
        assertTrue(jwtUtil.isValid(token));
    }

    @Test
    void generateTeacherToken_containsCorrectClaims() {
        String token = jwtUtil.generateTeacherToken(1L, "test@test.com", "TEACHER");

        assertEquals(1L, jwtUtil.getUserId(token));
        assertEquals("test@test.com", jwtUtil.getEmail(token));
        assertEquals("TEACHER", jwtUtil.getRole(token));
    }

    @Test
    void generateStudentToken_returnsValidToken() {
        String token = jwtUtil.generateStudentToken(5L, 10L, "STUDENT");

        assertNotNull(token);
        assertTrue(jwtUtil.isValid(token));
    }

    @Test
    void generateStudentToken_containsCorrectClaims() {
        String token = jwtUtil.generateStudentToken(5L, 10L, "STUDENT");

        assertEquals(5L, jwtUtil.getUserId(token));
        assertEquals(10L, jwtUtil.getTestId(token));
        assertEquals("STUDENT", jwtUtil.getRole(token));
    }

    @Test
    void isValid_returnsFalseForInvalidToken() {
        assertFalse(jwtUtil.isValid("invalid.token.here"));
    }

    @Test
    void isValid_returnsFalseForNull() {
        assertFalse(jwtUtil.isValid(null));
    }

    @Test
    void parseToken_returnsClaimsForValidToken() {
        String token = jwtUtil.generateTeacherToken(1L, "test@test.com", "TEACHER");

        Claims claims = jwtUtil.parseToken(token);

        assertNotNull(claims);
        assertEquals("1", claims.getSubject());
    }
}
