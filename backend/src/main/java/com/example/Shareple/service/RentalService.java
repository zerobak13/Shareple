package com.example.Shareple.service;

import com.example.Shareple.dto.RentalMessage;
import com.example.Shareple.entity.ChatRoom;
import com.example.Shareple.entity.Product;
import com.example.Shareple.entity.ProductStatus;
import com.example.Shareple.entity.Rental;
import com.example.Shareple.entity.RentalStatus;
import com.example.Shareple.entity.User;
import com.example.Shareple.repository.ChatRoomRepository;
import com.example.Shareple.repository.ProductRepository;
import com.example.Shareple.repository.RentalRepository;
import com.example.Shareple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    // STOMP 브로드캐스트용
    private final SimpMessagingTemplate messagingTemplate;

    /** 프로젝트 STOMP 구독 주소에 맞춰 수정하세요. (예: "/topic/chat/{roomId}" 또는 "/sub/chat/room/{roomId}") */
    private String topic(Long roomId) {
        return "/topic/chat/" + roomId;
    }

    /** 거래 제안 (등록자 → 대여자) : 채팅방에 제안 메시지 전송 + 상태 PENDING 저장
     *  시그니처: ownerId, productId, roomId, borrowerId, start, end, deposit  (A 방식)
     */
    public Rental propose(Long ownerId,
                          Long productId,
                          Long roomId,
                          Long borrowerId,
                          LocalDate startDate,
                          LocalDate endDate,
                          int deposit) {

        // --- 기본 검증 ---
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("대여 기간이 비어 있습니다.");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("대여 종료일이 시작일보다 빠릅니다.");
        }
        if (deposit < 0) {
            throw new IllegalArgumentException("보증금은 음수일 수 없습니다.");
        }

        // --- 엔티티 조회 ---
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품이 존재하지 않습니다."));

        if (product.getStatus() != ProductStatus.AVAILABLE) {
            throw new IllegalStateException("이미 대여중인 상품입니다.");
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("등록자(Owner) 사용자가 존재하지 않습니다."));
        User borrower = userRepository.findById(borrowerId)
                .orElseThrow(() -> new IllegalArgumentException("대여자(Borrower) 사용자가 존재하지 않습니다."));

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        // (선택) 권한/참여자 검증: product.getOwner()가 있다면 ownerId와 일치 여부 확인, room 참여자에 owner/borrower 포함 여부 확인 등

        // --- 저장 ---
        Rental rental = new Rental();
        rental.setProduct(product);
        rental.setOwner(owner);
        rental.setBorrower(borrower);
        rental.setChatRoom(room);
        rental.setStartDate(startDate);
        rental.setEndDate(endDate);
        rental.setDeposit(deposit);
        rental.setStatus(RentalStatus.PENDING);

        rentalRepository.save(rental);

        // --- 채팅으로 제안 메시지 브로드캐스트 ---
        RentalMessage msg = new RentalMessage();
        msg.setType("RENTAL_PROPOSAL");
        msg.setRoomId(roomId);
        msg.setRentalId(rental.getId());
        msg.setProductId(product.getId());
        msg.setProductName(product.getName());
        msg.setPeriodStart(startDate.toString());
        msg.setPeriodEnd(endDate.toString());
        msg.setDeposit(deposit);
        msg.setStatus(rental.getStatus().name());
        msg.setActions(new String[]{"ACCEPT", "REJECT"});

        messagingTemplate.convertAndSend(topic(roomId), msg);
        return rental;
    }

    /** 수락 (대여자만 가능) : Rental=ACTIVE, Product=RENTED, 채팅 업데이트 */
    public void accept(Long rentalId, Long borrowerId) {
        Rental r = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("거래가 존재하지 않습니다."));
        if (!r.getBorrower().getId().equals(borrowerId)) {
            throw new IllegalArgumentException("권한이 없습니다. (수락은 대여자만 가능)");
        }
        if (r.getStatus() != RentalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        // 상태 전환
        r.setStatus(RentalStatus.ACTIVE);
        r.getProduct().setStatus(ProductStatus.RENTED);

        // 채팅 알림
        RentalMessage msg = new RentalMessage();
        msg.setType("RENTAL_UPDATE");
        msg.setRoomId(r.getChatRoom().getId());
        msg.setRentalId(r.getId());
        msg.setProductId(r.getProduct().getId());
        msg.setStatus(r.getStatus().name());
        msg.setText("거래가 수락되어 대여중으로 전환되었습니다.");
        msg.setActions(new String[]{"COMPLETE"});  // 양쪽 모두 거래완료 버튼 표시
        msg.setCompleteProgress(0);

        messagingTemplate.convertAndSend(topic(r.getChatRoom().getId()), msg);
    }

    /** 거절 (대여자만 가능) : Rental=REJECTED, 채팅 업데이트 */
    public void reject(Long rentalId, Long borrowerId) {
        Rental r = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("거래가 존재하지 않습니다."));
        if (!r.getBorrower().getId().equals(borrowerId)) {
            throw new IllegalArgumentException("권한이 없습니다. (거절은 대여자만 가능)");
        }
        if (r.getStatus() != RentalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        r.setStatus(RentalStatus.REJECTED);

        RentalMessage msg = new RentalMessage();
        msg.setType("RENTAL_UPDATE");
        msg.setRoomId(r.getChatRoom().getId());
        msg.setRentalId(r.getId());
        msg.setProductId(r.getProduct().getId());
        msg.setStatus(r.getStatus().name());
        msg.setText("거래가 거절되었습니다.");
        msg.setActions(new String[]{}); // 버튼 없음
        msg.setCompleteProgress(0);

        messagingTemplate.convertAndSend(topic(r.getChatRoom().getId()), msg);
    }

    /** 거래완료 (양쪽 다 눌러야 최종 완료) : 1/2 → 진행중, 2/2 → COMPLETED + 상품 AVAILABLE 복귀 */
    public void complete(Long rentalId, Long userId) {
        Rental r = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("거래가 존재하지 않습니다."));

        boolean touched = false;
        if (userId.equals(r.getOwner().getId())) {
            if (!r.isOwnerCompleted()) { r.setOwnerCompleted(true); touched = true; }
        } else if (userId.equals(r.getBorrower().getId())) {
            if (!r.isBorrowerCompleted()) { r.setBorrowerCompleted(true); touched = true; }
        } else {
            throw new IllegalArgumentException("권한이 없습니다. (거래 당사자만 완료 가능)");
        }

        if (!touched) {
            // 이미 완료 버튼을 누른 사용자가 다시 누른 경우는 무시
            return;
        }

        int progress = (r.isOwnerCompleted() ? 1 : 0) + (r.isBorrowerCompleted() ? 1 : 0);

        if (r.isOwnerCompleted() && r.isBorrowerCompleted()) {
            r.setStatus(RentalStatus.COMPLETED);
            r.getProduct().setStatus(ProductStatus.AVAILABLE);
        }

        RentalMessage msg = new RentalMessage();
        msg.setType("RENTAL_UPDATE");
        msg.setRoomId(r.getChatRoom().getId());
        msg.setRentalId(r.getId());
        msg.setProductId(r.getProduct().getId());
        msg.setStatus(r.getStatus().name());
        msg.setCompleteProgress(progress);

        if (r.getStatus() == RentalStatus.COMPLETED) {
            msg.setText("양쪽 모두 거래완료를 눌렀습니다. 거래가 완료되었습니다. (리뷰 작성 가능)");
            msg.setActions(new String[]{}); // 버튼 제거
        } else {
            msg.setText("거래완료 진행 중... (" + progress + "/2)");
            msg.setActions(new String[]{"COMPLETE"});
        }

        messagingTemplate.convertAndSend(topic(r.getChatRoom().getId()), msg);
    }
}
