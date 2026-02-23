package com.carrental.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.carrental.backend.model.Car;

public interface CarRepository extends MongoRepository<Car, String> {

    // -------- Dealer specific --------
    List<Car> findByDealerId(String dealerId);

    // -------- User browsing --------
    List<Car> findByAvailableTrue();

    // -------- Dealer + availability --------
    List<Car> findByDealerIdAndAvailableTrue(String dealerId);
}
