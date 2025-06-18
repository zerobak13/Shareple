package com.example.Shareple.controller;

import com.example.Shareple.dto.ProductRequestDto;
import com.example.Shareple.entity.Product;
import com.example.Shareple.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String registerProduct(
            @ModelAttribute ProductRequestDto dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        String imageUrl = null;

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String uploadDir = "uploads/"; // 상대경로 또는 절대경로 사용 가능
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                imageUrl = "/static/" + fileName; // 이 경로로 접근하도록 프론트와 약속
            } catch (IOException e) {
                e.printStackTrace();
                return "이미지 업로드 실패";
            }
        }

        // Product Entity에 매핑해서 저장
        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setDeposit(dto.getDeposit());
        product.setDescription(dto.getDescription());
        product.setCategory(dto.getCategory());
        product.setDeadline(dto.getDeadline());
        product.setMethod(dto.getMethod());
        product.setLocation(dto.getLocation());
        product.setImageUrl(imageUrl); // 이미지 경로 저장

        productService.saveProduct(product);

        return "물품 등록 성공";
    }
}
