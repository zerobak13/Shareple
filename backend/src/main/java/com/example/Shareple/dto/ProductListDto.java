package com.example.Shareple.dto;

import com.example.Shareple.entity.Product;
import lombok.Getter;

@Getter
public class ProductListDto {
    private Long id;
    private String name;
    private int price;
    private String imageUrl;
    private String status; // AVAILABLE | RENTED

    public ProductListDto(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.price = product.getPrice();
        this.imageUrl = product.getImageUrl();
        this.status = (product.getStatus() != null)
            ? product.getStatus().name()
            : "AVAILABLE";
    }
}
