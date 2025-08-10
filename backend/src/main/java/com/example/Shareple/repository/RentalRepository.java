package com.example.Shareple.repository;

import com.example.Shareple.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;      // ★ 추가
import java.util.Optional;
import com.example.Shareple.entity.RentalStatus; // ★ 추가

public interface RentalRepository extends JpaRepository<Rental, Long> {
    Optional<Rental> findTopByChatRoomIdAndStatusInOrderByIdDesc(Long chatRoomId, List<RentalStatus> statuses);

}
