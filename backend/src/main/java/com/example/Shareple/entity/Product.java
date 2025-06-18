package com.example.Shareple.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;




@Entity
@Getter @Setter
public class Product {

    @Id @GeneratedValue
    private Long id;

    private String name;
    private int price;
    private int deposit;
    private String description;
    private String category;
    private String deadline;
    private String method;
    private String location;
    private String imageUrl; //  이미지 파일 경로
}
