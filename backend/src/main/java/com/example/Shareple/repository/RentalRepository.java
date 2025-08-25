package com.example.Shareple.repository;

import com.example.Shareple.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByKakaoId(String kakaoId);
}
