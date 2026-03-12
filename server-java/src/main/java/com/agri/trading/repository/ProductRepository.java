package com.agri.trading.repository;

import com.agri.trading.model.Product;
import com.agri.trading.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategory(ProductCategory category);
    List<Product> findByActiveTrue();
}
