package com.carrental.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.carrental.backend.model.Car;
import com.carrental.backend.model.User;
import com.carrental.backend.repository.CarRepository;
import com.carrental.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/cars")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminCarController {

    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public AdminCarController(
            CarRepository carRepository,
            UserRepository userRepository
    ) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
    }

    // ==================================================
    // ✅ ADMIN: VIEW ALL CARS
    // ==================================================
    @GetMapping
    public ResponseEntity<List<Car>> getAllCars() {
        return ResponseEntity.ok(carRepository.findAll());
    }

    // ==================================================
    // ✅ ADMIN: ASSIGN / REASSIGN CAR TO DEALER
    // ==================================================
    @PutMapping("/{carId}/assign/{dealerId}")
    public ResponseEntity<?> assignCarToDealer(
            @PathVariable String carId,
            @PathVariable String dealerId
    ) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        User dealer = userRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found"));

        if (!"DEALER".equals(dealer.getRole())) {
            return ResponseEntity.badRequest()
                    .body("User is not a dealer");
        }

        if (!dealer.isActive()) {
            return ResponseEntity.badRequest()
                    .body("Dealer is disabled");
        }

        car.setDealerId(dealer.getId());
        car.setDealerName(dealer.getName());

        carRepository.save(car);

        return ResponseEntity.ok("Car assigned to dealer successfully");
    }

    // ==================================================
    // ✅ ADMIN: ENABLE / DISABLE CAR
    // ==================================================
    @PutMapping("/{carId}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable String carId,
            @RequestParam boolean available
    ) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        car.setAvailable(available);
        carRepository.save(car);

        return ResponseEntity.ok("Car availability updated");
    }
}
