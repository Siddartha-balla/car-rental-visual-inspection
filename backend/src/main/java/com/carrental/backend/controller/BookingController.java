package com.carrental.backend.controller;

import com.carrental.backend.model.Booking;
import com.carrental.backend.model.Car;
import com.carrental.backend.model.User;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.CarRepository;
import com.carrental.backend.repository.UserRepository;
import com.carrental.backend.security.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public BookingController(
            BookingRepository bookingRepository,
            CarRepository carRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil
    ) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
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
    // ✅ DEALER: GET BOOKINGS FOR MY CARS
    // URL: GET /api/bookings/dealer
    // ==================================================
    @GetMapping("/dealer")
    public ResponseEntity<List<Booking>> dealerBookings(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        User dealer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Dealer not found"));

        return ResponseEntity.ok(
                bookingRepository.findByDealerId(dealer.getId())
        );
    }
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam String carId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        List<Booking> conflicts =
                bookingRepository.findConflictingBookings(
                        carId, startDate, endDate
                );

        return ResponseEntity.ok(conflicts.isEmpty());
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
        String token = authHeader.substring(7);
        String userEmail = jwtUtil.extractEmail(token);

        Car car = carRepository.findById(booking.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        // ✅ Date validation
        if (booking.getEndDate().isBefore(booking.getStartDate())) {
            return ResponseEntity.badRequest()
                    .body("End date cannot be before start date");
        }

        // ✅ Date-based availability check
        List<Booking> conflicts =
                bookingRepository.findConflictingBookings(
                        booking.getCarId(),
                        booking.getStartDate(),
                        booking.getEndDate()
                );

        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);

            String message = "Car is already booked between " +
                    conflict.getStartDate() +
                    " and " +
                    conflict.getEndDate();

            return ResponseEntity
                    .badRequest()
                    .body(message);
        }


        long days = ChronoUnit.DAYS.between(
                booking.getStartDate(),
                booking.getEndDate()
        ) + 1;

        booking.setUserEmail(userEmail);
        booking.setCarName(car.getCarName());
        booking.setDealerId(car.getDealerId());
        booking.setDealerName(car.getDealerName());
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
