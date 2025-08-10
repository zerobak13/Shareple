package com.example.Shareple.dto;

import com.example.Shareple.entity.Product;
import com.example.Shareple.entity.User;
import lombok.Getter;

@Getter
public class ProductDetailDto {
    private final Long id;
    private final String name;
    private final int price;
    private final int deposit;
    private final String description;
    private final String category;
    private final String deadline;
    private final String method;
    private final String location;
    private final String imageUrl;

    // 👇 추가
    private final String status; // "AVAILABLE" | "RENTED"

    private final String sellerNickname;
    private final String sellerEmail;
    private final String sellerKakaoId;

    public ProductDetailDto(Product product, User user) {
        this.id = product.getId();
        this.name = product.getName();
        this.price = product.getPrice();
        this.deposit = product.getDeposit();
        this.description = product.getDescription();
        this.category = product.getCategory();
        this.deadline = product.getDeadline();
        this.method = product.getMethod();
        this.location = product.getLocation();
        this.imageUrl = product.getImageUrl();

        // 👇 추가: 널 세이프티까지
        this.status = (product.getStatus() != null)
                ? product.getStatus().name()
                : "AVAILABLE";

        this.sellerNickname = user.getNickname();
        this.sellerEmail = user.getEmail();
        this.sellerKakaoId = user.getKakaoId();
    }
}
