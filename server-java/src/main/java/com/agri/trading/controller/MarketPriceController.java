package com.agri.trading.controller;

import com.agri.trading.model.MarketPrice;
import com.agri.trading.repository.MarketPriceRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/market-prices")
@CrossOrigin(origins = "*")
public class MarketPriceController {

    private final MarketPriceRepository marketPriceRepository;

    public MarketPriceController(MarketPriceRepository marketPriceRepository) {
        this.marketPriceRepository = marketPriceRepository;
    }

    @GetMapping
    public ResponseEntity<List<MarketPrice>> getAllPrices() {
        return ResponseEntity.ok((List<MarketPrice>) marketPriceRepository.findAll());
    }

    @GetMapping("/latest")
    public ResponseEntity<List<MarketPrice>> getLatestPrices(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String location) {
        
        List<MarketPrice> prices;
        if (area != null && location != null) {
            prices = marketPriceRepository.findByLocationAndArea(location, area);
        } else if (location != null) {
            prices = marketPriceRepository.findByLocation(location);
        } else {
            prices = (List<MarketPrice>) marketPriceRepository.findAll();
        }
        return ResponseEntity.ok(prices);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MarketPrice>> getPricesByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(marketPriceRepository.findByProductId(productId));
    }
}
