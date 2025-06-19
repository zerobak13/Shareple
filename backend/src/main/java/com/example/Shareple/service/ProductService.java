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
        return productRepository.findByKakaoId(kakaoId);
    }

}
