// src/main/java/com/example/Shareple/repository/UserRepository.java
package com.example.Shareple.repository;

import com.example.Shareple.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByKakaoId(String kakaoId);
    Optional<User> findByEmail(String email);
}
