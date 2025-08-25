package com.example.Shareple.service;

import com.example.Shareple.dto.RentalDto;
import com.example.Shareple.entity.Rental;
import com.example.Shareple.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;

    public List<RentalDto> findRentalsByKakaoId(String kakaoId) {
        return rentalRepository.findByKakaoId(kakaoId).stream()
                .map(RentalDto::new)
                .collect(Collectors.toList());
    }
}
