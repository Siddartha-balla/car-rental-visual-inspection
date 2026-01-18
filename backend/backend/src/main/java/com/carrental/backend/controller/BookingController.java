package com.carrental.backend.controller;

import com.carrental.backend.model.Booking;
import com.carrental.backend.model.Car;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.CarRepository;
import com.carrental.backend.security.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final JwtUtil jwtUtil;

    public BookingController(
            BookingRepository bookingRepository,
            CarRepository carRepository,
            JwtUtil jwtUtil
    ) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.jwtUtil = jwtUtil;
    }

    // ==================================================
    // ✅ ADMIN: GET ALL BOOKINGS
    // URL: GET /api/bookings/admin
    // ==================================================
    @GetMapping("/admin")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    // ==================================================
    // ✅ CREATE BOOKING (USER)
    // URL: POST /api/bookings
    // ==================================================
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody Booking booking,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // remove "Bearer "
        String email = jwtUtil.extractEmail(token);

        Car car = carRepository.findById(booking.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        long days = ChronoUnit.DAYS.between(
                booking.getStartDate(),
                booking.getEndDate()
        ) + 1;

        booking.setUserEmail(email);
        booking.setCarName(car.getCarName());
        booking.setTotalPrice(days * car.getPricePerDay());
        booking.setStatus("BOOKED");

        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    // ==================================================
    // ✅ USER: GET MY BOOKINGS
    // URL: GET /api/bookings/my
    // ==================================================
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> myBookings(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        return ResponseEntity.ok(
                bookingRepository.findByUserEmail(email)
        );
    }
}
