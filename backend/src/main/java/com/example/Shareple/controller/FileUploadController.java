package com.example.Shareple.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
public class FileUploadController {

    @PostMapping("/api/upload")
    public ResponseEntity<String> upload(@RequestParam("image") MultipartFile image) throws IOException {
        // 1. 저장할 파일 이름 생성 (UUID + 원래 이름)
        String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();

        // 2. 저장 경로 설정 (예: /uploads)
        Path path = Paths.get("uploads", filename);
        Files.createDirectories(path.getParent());

        // 3. 파일 저장
        Files.write(path, image.getBytes());

        // 4. 프론트엔드에서 접근할 수 있도록 URL 리턴
        return ResponseEntity.ok("/uploads/" + filename);
    }
}
