package com.carrental.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.carrental.backend.model.User;
import com.carrental.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/dealers")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminDealerController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminDealerController(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ==================================================
    // ✅ ADMIN: GET ALL DEALERS
    // ==================================================
    @GetMapping
    public ResponseEntity<List<User>> getAllDealers() {

        List<User> dealers = userRepository.findByRole("DEALER");
        return ResponseEntity.ok(dealers);
    }

    // ==================================================
    // ✅ ADMIN: CREATE DEALER
    // ==================================================
    @PostMapping
    public ResponseEntity<?> createDealer(@RequestBody User dealer) {

        if (userRepository.findByEmail(dealer.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Dealer already exists");
        }

        dealer.setRole("DEALER");
        dealer.setPassword(passwordEncoder.encode(dealer.getPassword()));
        dealer.setActive(true);

        userRepository.save(dealer);

        return ResponseEntity.ok("Dealer created successfully");
    }

    // ==================================================
    // ✅ ADMIN: ENABLE / DISABLE DEALER
    // ==================================================
    @PutMapping("/{dealerId}/status")
    public ResponseEntity<?> updateDealerStatus(
            @PathVariable String dealerId,
            @RequestParam boolean active
    ) {

        User dealer = userRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found"));

        if (!"DEALER".equals(dealer.getRole())) {
            return ResponseEntity.badRequest()
                    .body("User is not a dealer");
        }

        dealer.setActive(active);
        userRepository.save(dealer);

        return ResponseEntity.ok(
                active ? "Dealer enabled" : "Dealer disabled"
        );
    }
}
