package com.example.Shareple.service;

import com.example.Shareple.dto.RentalMessage;
import com.example.Shareple.entity.*;
import com.example.Shareple.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;   // ⬅️ 추가

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** 프로젝트 STOMP 주소에 맞춰 조정 */
    private String topic(Long roomId) { return "/topic/chat/" + roomId; }

    /** 시스템(거래) 메시지 DB 저장 + 트랜잭션 커밋 후 방송 */
    private void saveSystemMessageAndBroadcast(Long roomId, String title, RentalMessage msg) {
        // 1) DB 저장
        ChatMessageEntity e = new ChatMessageEntity();
        e.setRoomId(String.valueOf(roomId));
        e.setSenderKakaoId("SYSTEM");
        e.setTimestamp(LocalDateTime.now());
        e.setType("SYSTEM");      // enum('SYSTEM','USER') 에 맞춤
        e.setMsgType("RENTAL");   // 우리 구분용
        e.setContent(title);      // 목록에서 보일 요약

        try {
            e.setPayloadJson(objectMapper.writeValueAsString(msg));
        } catch (Exception ignore) {
            e.setPayloadJson(null);
        }
        chatMessageRepository.save(e);

        // 2) 커밋 이후에만 소켓 방송 (정합성 보장)
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                messagingTemplate.convertAndSend(topic(roomId), msg);
            }
        });
    }

    /** 거래 제안 (등록자 → 대여자) */
    public Rental propose(Long ownerId,
                          Long productId,
                          Long roomId,
                          Long borrowerId,
                          LocalDate startDate,
                          LocalDate endDate,
                          int deposit) {

        if (startDate == null || endDate == null) throw new IllegalArgumentException("대여 기간이 비어 있습니다.");
        if (endDate.isBefore(startDate)) throw new IllegalArgumentException("대여 종료일이 시작일보다 빠릅니다.");
        if (deposit < 0) throw new IllegalArgumentException("보증금은 음수일 수 없습니다.");

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
        msg.setCompleteProgress(0);

        saveSystemMessageAndBroadcast(roomId, "대여 제안", msg);
        return rental;
    }

    /** 수락 (대여자만 가능) : Rental=ACTIVE, Product=RENTED */
    public void accept(Long rentalId, Long borrowerId) {
        Rental r = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("거래가 존재하지 않습니다."));
        if (!r.getBorrower().getId().equals(borrowerId)) {
            throw new IllegalArgumentException("권한이 없습니다. (수락은 대여자만 가능)");
        }
        if (r.getStatus() != RentalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        r.setStatus(RentalStatus.ACTIVE);
        r.getProduct().setStatus(ProductStatus.RENTED);

        RentalMessage msg = new RentalMessage();
        msg.setType("RENTAL_UPDATE");
        msg.setRoomId(r.getChatRoom().getId());
        msg.setRentalId(r.getId());
        msg.setProductId(r.getProduct().getId());
        msg.setDeposit(r.getDeposit());
        msg.setStatus(r.getStatus().name()); // ACTIVE
        msg.setText("거래가 수락되어 대여중으로 전환되었습니다.");
        msg.setActions(new String[]{"COMPLETE"});
        msg.setCompleteProgress(0);

        saveSystemMessageAndBroadcast(r.getChatRoom().getId(), "거래 업데이트", msg);
    }

    /** 거절 (대여자만 가능) : Rental=REJECTED */
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
        msg.setDeposit(r.getDeposit());
        msg.setStatus(r.getStatus().name()); // REJECTED
        msg.setText("거래가 거절되었습니다.");
        msg.setActions(new String[]{});
        msg.setCompleteProgress(0);

        saveSystemMessageAndBroadcast(r.getChatRoom().getId(), "거래 업데이트", msg);
    }

    /** 거래완료 (양쪽 다 눌러야 완료) : 1/2 → 진행중, 2/2 → COMPLETED + 상품 AVAILABLE */
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
        if (!touched) return;

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
        msg.setDeposit(r.getDeposit());
        msg.setStatus(r.getStatus().name()); // ACTIVE or COMPLETED
        msg.setCompleteProgress(progress);

        if (r.getStatus() == RentalStatus.COMPLETED) {
            msg.setText("양쪽 모두 거래완료를 눌렀습니다. 거래가 완료되었습니다. (리뷰 작성 가능)");
            msg.setActions(new String[]{}); // 버튼 제거
        } else {
            msg.setText("거래완료 진행 중... (" + progress + "/2)");
            msg.setActions(new String[]{"COMPLETE"});
        }

        saveSystemMessageAndBroadcast(r.getChatRoom().getId(), "거래 업데이트", msg);
    }
}
