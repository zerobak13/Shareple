package com.example.Shareple.dto;

import com.example.Shareple.entity.Rental;
import lombok.Getter;

@Getter
public class RentalDto {
    private Long id;
    private String title;
    private String startDate;
    private String endDate;
    private int price;
    private String status;
    private String ownerName;

    public RentalDto(Rental rental) {
        this.id = rental.getId();
        this.title = rental.getTitle();
        this.startDate = rental.getStartDate();
        this.endDate = rental.getEndDate();
        this.price = rental.getPrice();
        this.status = rental.getStatus();
        this.ownerName = rental.getOwnerName();
    }
}
