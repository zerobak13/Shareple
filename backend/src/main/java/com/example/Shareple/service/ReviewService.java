package com.example.Shareple.service;

import com.example.Shareple.dto.RatingSummaryDto;
import com.example.Shareple.dto.ReviewCreateRequest;
import com.example.Shareple.dto.ReviewResponseDto;
import com.example.Shareple.entity.Rental;
import com.example.Shareple.entity.RentalStatus;
import com.example.Shareple.entity.Review;
import com.example.Shareple.entity.User;
import com.example.Shareple.repository.RentalRepository;
import com.example.Shareple.repository.ReviewRepository;
import com.example.Shareple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponseDto writeReview(String reviewerKakaoId, ReviewCreateRequest req) {
        if (req == null || req.getRentalId() == null) {
            throw new IllegalArgumentException("rentalId 가 필요합니다.");
        }
        int rating = req.getRating();
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("평점은 1~5 사이여야 합니다.");
        }

        User reviewer = userRepository.findByKakaoId(reviewerKakaoId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Rental rental = rentalRepository.findById(req.getRentalId())
                .orElseThrow(() -> new IllegalArgumentException("거래가 존재하지 않습니다."));

        if (rental.getStatus() != RentalStatus.COMPLETED) {
            throw new IllegalStateException("완료된 거래에만 리뷰를 작성할 수 있습니다.");
        }

        Long ownerId = rental.getOwner() != null ? rental.getOwner().getId() : null;
        Long borrowerId = rental.getBorrower() != null ? rental.getBorrower().getId() : null;
        Long myId = reviewer.getId();
        if (myId == null || (!myId.equals(ownerId) && !myId.equals(borrowerId))) {
            throw new IllegalStateException("이 거래의 참여자가 아닙니다.");
        }

        // 중복 작성 방지
        if (reviewRepository.existsByRentalIdAndReviewerId(rental.getId(), myId)) {
            throw new IllegalStateException("이미 이 거래에 대한 리뷰를 작성했습니다.");
        }

        // 상대방 결정
        User reviewee = myId.equals(ownerId) ? rental.getBorrower() : rental.getOwner();
        if (reviewee == null) throw new IllegalStateException("리뷰 대상이 존재하지 않습니다.");

        Review saved = reviewRepository.save(Review.builder()
                .rental(rental)
                .product(rental.getProduct())
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(rating)
                .content(req.getContent() == null ? "" : req.getContent().trim())
                .build());

        return ReviewResponseDto.from(saved);
    }

    @Transactional(readOnly = true)
    public boolean existsForRental(String kakaoId, Long rentalId) {
        User me = userRepository.findByKakaoId(kakaoId).orElse(null);
        if (me == null || rentalId == null) return false;
        return reviewRepository.existsByRentalIdAndReviewerId(rentalId, me.getId());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> myWrittenReviews(String kakaoId) {
        User me = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        return reviewRepository.findByReviewerIdOrderByCreatedAtDesc(me.getId())
                .stream().map(ReviewResponseDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> myReceivedReviews(String kakaoId) {
        User me = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(me.getId())
                .stream().map(ReviewResponseDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> reviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId)
                .stream().map(ReviewResponseDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> reviewsForProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(ReviewResponseDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RatingSummaryDto summaryForUser(Long userId) {
        List<Review> reviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId);
        return summarize(reviews);
    }

    @Transactional(readOnly = true)
    public RatingSummaryDto summaryForProduct(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return summarize(reviews);
    }

    private RatingSummaryDto summarize(List<Review> reviews) {
        long count = reviews.size();
        double avg = count == 0 ? 0.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        // 소수 1자리 반올림
        double rounded = Math.round(avg * 10.0) / 10.0;
        return RatingSummaryDto.builder().count(count).average(rounded).build();
    }
}
