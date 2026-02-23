package com.carrental.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.carrental.backend.model.Car;
import com.carrental.backend.model.User;
import com.carrental.backend.repository.CarRepository;
import com.carrental.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CarController {

    private final CarRepository carRepository;
    private final UserRepository userRepository;

    /**
     * USER  -> see available cars
     * DEALER -> see own cars
     * ADMIN -> see all cars
     */
    @GetMapping
    public List<Car> getCars(Principal principal) {

        // Not logged in (public access)
        if (principal == null) {
            return carRepository.findByAvailableTrue();
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        switch (user.getRole()) {
            case "ADMIN":
                return carRepository.findAll();

            case "DEALER":
                return carRepository.findByDealerId(user.getId());

            default: // USER
                return carRepository.findByAvailableTrue();
        }
    }

    /**
     * DEALER -> add own car
     * ADMIN  -> add car for any dealer (optional)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Car addCar(
            @RequestParam String carName,
            @RequestParam String brand,
            @RequestParam String model,
            @RequestParam String fuelType,
            @RequestParam String transmission,
            @RequestParam int seats,
            @RequestParam double pricePerDay,
            @RequestParam MultipartFile image,
            Principal principal
    ) throws Exception {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"DEALER".equals(user.getRole()) || !user.isActive()) {
            throw new RuntimeException("Only active dealers can add cars");
        }

        // 📂 Save image
        String uploadDir = "uploads/cars/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path path = Paths.get(uploadDir + filename);
        Files.write(path, image.getBytes());

        // 🚗 Save car
        Car car = new Car();
        car.setCarName(carName);
        car.setBrand(brand);
        car.setModel(model);
        car.setFuelType(fuelType);
        car.setTransmission(transmission);
        car.setSeats(seats);
        car.setPricePerDay(pricePerDay);
        car.setImageUrl(filename);
        car.setAvailable(true);

        car.setDealerId(user.getId());
        car.setDealerName(user.getName());

        return carRepository.save(car);
    }

}
