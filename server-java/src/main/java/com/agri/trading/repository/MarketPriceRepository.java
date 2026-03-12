package com.agri.trading.repository;

import com.agri.trading.model.MarketPrice;
import com.agri.trading.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, String> {
    List<MarketPrice> findByProduct(Product product);
    List<MarketPrice> findByProductId(String productId);
    List<MarketPrice> findByLocation(String location);
    List<MarketPrice> findByLocationAndArea(String location, String area);
    List<MarketPrice> findByTimestampAfter(Instant timestamp);
    List<MarketPrice> findTopByProductIdOrderByTimestampDesc(String productId);
}
