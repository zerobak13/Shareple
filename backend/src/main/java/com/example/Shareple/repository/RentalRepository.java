package com.example.Shareple.repository;

import com.example.Shareple.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;      // ★ 추가
import java.util.Optional;
import com.example.Shareple.entity.RentalStatus; // ★ 추가

public interface RentalRepository extends JpaRepository<Rental, Long> {
    Optional<Rental> findTopByChatRoomIdAndStatusInOrderByIdDesc(Long chatRoomId, List<RentalStatus> statuses);

    // 내가 빌린(대여자) 내역
    List<Rental> findByBorrowerIdOrderByIdDesc(Long borrowerId);
    List<Rental> findByBorrowerIdAndStatusInOrderByIdDesc(Long borrowerId, List<RentalStatus> statuses);

    // 내가 빌려준(소유자) 내역
    List<Rental> findByOwnerIdOrderByIdDesc(Long ownerId);
    List<Rental> findByOwnerIdAndStatusInOrderByIdDesc(Long ownerId, List<RentalStatus> statuses);

    // 리뷰 작성 가능 여부 체크용 (특정 rental 이 두 참여자 중 한 명의 것인지)
    Optional<Rental> findByIdAndStatus(Long id, RentalStatus status);
}
