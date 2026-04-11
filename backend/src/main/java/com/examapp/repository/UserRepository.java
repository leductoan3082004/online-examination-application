package com.examapp.repository;

import com.examapp.entity.User;
import com.examapp.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByNameAndRole(String name, Role role);
}
