package com.carrental.backend.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.carrental.backend.model.Car;
import com.carrental.backend.repository.CarRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CarController {

    private final CarRepository carRepository;

    @GetMapping
    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    @PostMapping
    public Car addCar(@RequestBody Car car) {
        return carRepository.save(car);
    }
}
