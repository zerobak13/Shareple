package com.example.Shareple.repository;

import com.example.Shareple.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    /** 내가 쓴 문의 (마이페이지 고객지원 > 내 문의 목록) */
    List<Inquiry> findByUser_IdOrderByCreatedAtDesc(Long userId);

    /** 관리자: 전체 문의 최신순 */
    List<Inquiry> findAllByOrderByCreatedAtDesc();

    /** 관리자: 상태별 (OPEN / ANSWERED) 목록 */
    List<Inquiry> findByStatusOrderByCreatedAtDesc(Inquiry.Status status);

    /** 관리자: OPEN 개수 (대시보드용) */
    long countByStatus(Inquiry.Status status);
}
