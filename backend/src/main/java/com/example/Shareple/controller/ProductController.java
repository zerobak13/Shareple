package com.example.Shareple.controller;

import com.example.Shareple.dto.ProductRequestDto;
import com.example.Shareple.entity.Product;
import com.example.Shareple.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import com.example.Shareple.entity.Product;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String registerProduct(
            @ModelAttribute ProductRequestDto dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal OAuth2User user // ✅ 사용자 정보 받기
    ) {
        String imageUrl = null;

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String uploadDir = "uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                imageUrl = "/uploads/" + fileName;
            } catch (IOException e) {
                e.printStackTrace();
                return "이미지 업로드 실패";
            }
        }

        String kakaoId = user.getAttribute("id").toString(); // ✅ 카카오 ID 추출

        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setDeposit(dto.getDeposit());
        product.setDescription(dto.getDescription());
        product.setCategory(dto.getCategory());
        product.setDeadline(dto.getDeadline());
        product.setMethod(dto.getMethod());
        product.setLocation(dto.getLocation());
        product.setImageUrl(imageUrl);
        product.setKakaoId(kakaoId); // ✅ 카카오 ID 저장

        productService.saveProduct(product);

        return "물품 등록 성공";
    }


    @GetMapping("/my")
    public List<Product> getMyProducts(@AuthenticationPrincipal OAuth2User user) {
        String kakaoId = user.getAttribute("id").toString();
        return productService.findProductsByKakaoId(kakaoId);
    }

    // 3. 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductRequestDto dto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal OAuth2User user
    ) {
        String kakaoId = user.getAttribute("id").toString();
        Product product = productService.findById(id);

        if (!product.getKakaoId().equals(kakaoId)) {
            return ResponseEntity.status(403).body("권한이 없습니다");
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageUrl(saveImage(imageFile));
        }

        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setDeposit(dto.getDeposit());
        product.setDescription(dto.getDescription());
        product.setCategory(dto.getCategory());
        product.setDeadline(dto.getDeadline());
        product.setMethod(dto.getMethod());
        product.setLocation(dto.getLocation());

        productService.saveProduct(product);
        return ResponseEntity.ok("수정 완료");
    }

    // 4. 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User user
    ) {
        String kakaoId = user.getAttribute("id").toString();
        Product product = productService.findById(id);

        if (!product.getKakaoId().equals(kakaoId)) {
            return ResponseEntity.status(403).body("권한이 없습니다");
        }

        productService.deleteProduct(id);
        return ResponseEntity.ok("삭제 완료");
    }

    // 이미지 저장 유틸
    private String saveImage(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) return null;
        try {
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + fileName;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

}
