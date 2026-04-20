package com.example.Shareple.entity;

import com.example.Shareple.entity.ProductStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;




@Entity
@Getter @Setter
public class Product {

    @Id @GeneratedValue
    private Long id;
    private String kakaoId;
    private String name;
    private int price;
    private int deposit;
    private String description;
    private String category;
    private String deadline;
    private String method;
    private String location;
    private String imageUrl; //  이미지 파일 경로

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.AVAILABLE;

    @Version
    private Long version;
}

