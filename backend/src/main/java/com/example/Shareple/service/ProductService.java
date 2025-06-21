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

public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("물품을 찾을 수 없습니다"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

}
