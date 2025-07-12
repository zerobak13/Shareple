package com.example.Shareple.service;

import com.example.Shareple.entity.Product;
import com.example.Shareple.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;



@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> findProductsByKakaoId(String kakaoId) {
        return productRepository.findByKakaoIdOrderByIdDesc(kakaoId);
    }

    public List<Product> findAllProducts() {
        return productRepository.findAllByOrderByIdDesc();
    }


    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("물품을 찾을 수 없습니다"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }


    // 👇 ProductService.java 내부에 추가
    public List<Product> filterProducts(String location, String deadline, Integer minPrice, Integer maxPrice, String category) {
        List<Product> all = productRepository.findAll(); // 우선 전체 가져와서 메모리에서 필터링

        return all.stream()
                .filter(p -> location == null || p.getLocation().contains(location))
                .filter(p -> deadline == null || p.getDeadline().compareTo(deadline) <= 0)
                .filter(p -> minPrice == null || p.getPrice() >= minPrice)
                .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
                .filter(p -> category == null || p.getCategory().equals(category))
                .toList();
    }
}

