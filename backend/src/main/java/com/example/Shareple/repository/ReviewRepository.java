package com.example.Shareple.repository;

import com.example.Shareple.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    /** 같은 사용자가 같은 거래에 대해 중복 리뷰를 쓰지 못하도록 체크 */
    Optional<Review> findByRentalIdAndReviewerId(Long rentalId, Long reviewerId);
    boolean existsByRentalIdAndReviewerId(Long rentalId, Long reviewerId);

    /** 내가 작성한 리뷰 (마이페이지 '내가 작성한 리뷰') */
    List<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);

    /** 내가 받은 리뷰 (마이페이지 '내 물품/나에게 달린 리뷰') */
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    /** 특정 상품에 달린 리뷰 (상품 상세 화면) */
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
}
