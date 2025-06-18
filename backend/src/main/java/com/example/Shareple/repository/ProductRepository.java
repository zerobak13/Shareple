// repository/ProductRepository.java
package com.example.Shareple.repository;

import com.example.Shareple.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {}
