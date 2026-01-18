package com.carrental.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.carrental.backend.model.Car;

public interface CarRepository extends MongoRepository<Car, String> {
}
