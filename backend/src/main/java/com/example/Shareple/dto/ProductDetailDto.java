package com.example.Shareple.dto;

import com.example.Shareple.entity.Product;
import com.example.Shareple.domain.User;
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
        this.sellerNickname = user.getNickname();  // ❗ User 클래스 구조에 맞게 수정
        this.sellerEmail = user.getEmail();        // ❗ User 클래스 구조에 맞게 수정
        this.sellerKakaoId = user.getKakaoId();

    }
}
