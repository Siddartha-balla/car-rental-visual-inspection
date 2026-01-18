package com.carrental.backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.carrental.backend.model.Car;
import com.carrental.backend.repository.CarRepository;

@RestController
@RequestMapping("/api/admin/cars")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminCarController {

    private final CarRepository carRepository;

    public AdminCarController(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    // 📌 Folder where images will be stored
    private static final String UPLOAD_DIR =
            "uploads/cars/";

    @PostMapping
    public ResponseEntity<?> addCar(
            @RequestParam String carName,
            @RequestParam String brand,
            @RequestParam String model,
            @RequestParam String fuelType,
            @RequestParam String transmission,
            @RequestParam int seats,
            @RequestParam double pricePerDay,
            @RequestParam MultipartFile image
    ) {
        try {
            // ✅ Create directory if not exists
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // ✅ Save image
            String fileName = image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, image.getBytes());

            // ✅ Save car details
            Car car = new Car();
            car.setCarName(carName);
            car.setBrand(brand);
            car.setModel(model);
            car.setFuelType(fuelType);
            car.setTransmission(transmission);
            car.setSeats(seats);
            car.setPricePerDay(pricePerDay);

            // VERY IMPORTANT
            car.setImageUrl(fileName);

            carRepository.save(car);

            return ResponseEntity.ok("Car added successfully");

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Error saving car");
        }
    }
}
