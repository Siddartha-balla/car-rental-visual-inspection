package com.carrental.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.carrental.backend.model.User;
import com.carrental.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/dealers")
@CrossOrigin(origins = "http://localhost:3000")
public class DealerAuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DealerAuthController(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================
    // ✅ PUBLIC: DEALER REGISTER (REQUEST)
    // =========================================
    @PostMapping("/register")
    public ResponseEntity<?> registerDealer(@RequestBody User dealer) {

        if (userRepository.findByEmail(dealer.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        dealer.setRole("DEALER");
        dealer.setPassword(passwordEncoder.encode(dealer.getPassword()));
        dealer.setActive(false); // 🔥 Admin approval required

        userRepository.save(dealer);

        return ResponseEntity.ok(
                "Dealer registered. Waiting for admin approval."
        );
    }
}
