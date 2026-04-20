package com.example.Shareple.dto;

import com.example.Shareple.entity.Rental;
import com.example.Shareple.entity.RentalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 마이페이지 대여/반납 내역 목록 항목.
 * 프론트의 RentalHistoryPage / ReturnHistoryPage 가 소비한다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalListItemDto {
    private Long rentalId;
    private RentalStatus status;

    private Long productId;
    private String productName;
    private String productImageUrl;

    private Long ownerId;
    private String ownerNickname;

    private Long borrowerId;
    private String borrowerNickname;

    private Long chatRoomId;

    private LocalDate startDate;
    private LocalDate endDate;
    private int deposit;

    private boolean ownerCompleted;
    private boolean borrowerCompleted;

    /** 내가 owner 였는지 borrower 였는지 (프론트에서 편의상 내려줌) */
    private String myRole; // "OWNER" | "BORROWER"

    public static RentalListItemDto from(Rental r, String myRole) {
        return RentalListItemDto.builder()
                .rentalId(r.getId())
                .status(r.getStatus())
                .productId(r.getProduct() != null ? r.getProduct().getId() : null)
                .productName(r.getProduct() != null ? r.getProduct().getName() : null)
                .productImageUrl(r.getProduct() != null ? r.getProduct().getImageUrl() : null)
                .ownerId(r.getOwner() != null ? r.getOwner().getId() : null)
                .ownerNickname(r.getOwner() != null ? r.getOwner().getNickname() : null)
                .borrowerId(r.getBorrower() != null ? r.getBorrower().getId() : null)
                .borrowerNickname(r.getBorrower() != null ? r.getBorrower().getNickname() : null)
                .chatRoomId(r.getChatRoom() != null ? r.getChatRoom().getId() : null)
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .deposit(r.getDeposit())
                .ownerCompleted(r.isOwnerCompleted())
                .borrowerCompleted(r.isBorrowerCompleted())
                .myRole(myRole)
                .build();
    }
}
