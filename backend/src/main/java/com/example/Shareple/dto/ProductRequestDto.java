package com.example.Shareple.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class ProductRequestDto {
    private String name;
    private int price;
    private int deposit;
    private String description;
    private String category;
    private String deadline;
    private String method;
    private String location;
}
