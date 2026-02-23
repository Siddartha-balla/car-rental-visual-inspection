package com.carrental.backend.controller;

import com.carrental.backend.service.DamageInspectionService;
import com.carrental.backend.dto.DamagePredictionResponse;
import com.carrental.backend.model.Booking;
import com.carrental.backend.model.User;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.UserRepository;
import com.carrental.backend.security.JwtUtil;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/inspection")
@CrossOrigin(origins = "http://localhost:3000")
public class InspectionController {

    private final BookingRepository bookingRepository;
    private final DamageInspectionService damageInspectionService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // 📂 Image storage directories
    private static final String PICKUP_DIR = "uploads/inspection/pickup/";
    private static final String RETURN_DIR = "uploads/inspection/return/";

    public InspectionController(
            BookingRepository bookingRepository,
            DamageInspectionService damageInspectionService,
            UserRepository userRepository,
            JwtUtil jwtUtil
    ) {
        this.bookingRepository = bookingRepository;
        this.damageInspectionService = damageInspectionService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ==================================================
    // 🔥 ML VALIDATION (CAR CHECK ONLY – SAFE)
    // ==================================================
    private boolean validateImageWithML(MultipartFile image, String side) throws Exception {

        String flaskUrl = "http://localhost:5000/validate-image";
        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("side", side);
        body.add("image", new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<?> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(flaskUrl, request, String.class);
            return true;
        } catch (HttpClientErrorException.BadRequest e) {
            return false; // not a car
        } catch (Exception e) {
            return true; // ML uncertainty → allow
        }
    }

    // ==================================================
    // ✅ DEALER: PICKUP INSPECTION
    // BOOKED → ONGOING
    // ==================================================
    @PostMapping("/pickup/{bookingId}")
    public ResponseEntity<?> pickupInspection(
            @PathVariable String bookingId,
            @RequestParam("images") MultipartFile[] images,
            @RequestHeader("Authorization") String authHeader
    ) throws Exception {

        User dealer = authenticateDealer(authHeader);
        Booking booking = getDealerBooking(bookingId, dealer);

        if (!"BOOKED".equals(booking.getStatus())) {
            return ResponseEntity.badRequest().body("Invalid booking state");
        }

        if (images.length != 4) {
            return ResponseEntity.badRequest()
                    .body("Upload all 4 side images (FRONT, LEFT, BACK, RIGHT)");
        }

        String[] sides = {"FRONT", "LEFT", "BACK", "RIGHT"};

        for (int i = 0; i < 4; i++) {
            if (!validateImageWithML(images[i], sides[i])) {
                return ResponseEntity.badRequest()
                        .body("Invalid image for side: " + sides[i]);
            }
        }

        List<String> savedImages = saveImages(images, PICKUP_DIR);

        booking.setPickupImages(savedImages);
        booking.setStatus("ONGOING");
        bookingRepository.save(booking);

        return ResponseEntity.ok("Pickup inspection completed");
    }

    // ==================================================
    // ✅ DEALER: RETURN INSPECTION
    // ==================================================
    @PostMapping("/return/{bookingId}")
    public ResponseEntity<?> returnInspection(
            @PathVariable String bookingId,
            @RequestParam("images") MultipartFile[] images,
            @RequestHeader("Authorization") String authHeader
    ) throws Exception {

        User dealer = authenticateDealer(authHeader);
        Booking booking = getDealerBooking(bookingId, dealer);

        if (!"ONGOING".equals(booking.getStatus())) {
            return ResponseEntity.badRequest().body("Invalid booking state");
        }

        if (images.length != 4) {
            return ResponseEntity.badRequest()
                    .body("Upload all 4 side images (FRONT, LEFT, BACK, RIGHT)");
        }

        String[] sides = {"FRONT", "LEFT", "BACK", "RIGHT"};

        for (int i = 0; i < 4; i++) {
            if (!validateImageWithML(images[i], sides[i])) {
                return ResponseEntity.badRequest()
                        .body("Invalid image for side: " + sides[i]);
            }
        }

        List<String> savedImages = saveImages(images, RETURN_DIR);

        boolean anyDamage = false;
        double maxSeverity = 0;
        StringBuilder damageSummary = new StringBuilder();

        for (int i = 0; i < 4; i++) {

            File before = new File(booking.getPickupImages().get(i));
            File after = new File(savedImages.get(i));

            DamagePredictionResponse response =
                    damageInspectionService.inspectDamage(before, after);

            double probability = response.getDamage_probability();
            double severity = response.getSeverity();

            boolean damaged = probability > 0.5 && severity > 15;

            damageSummary.append(sides[i])
                    .append("=")
                    .append(damaged ? "DAMAGED" : "GOOD")
                    .append("(").append(Math.round(severity)).append(");");

            if (damaged) {
                anyDamage = true;
                maxSeverity = Math.max(maxSeverity, severity);
            }
        }

        booking.setReturnImages(savedImages);
        booking.setDamageScore(maxSeverity);
        booking.setMlResult(
                (anyDamage ? "OVERALL=DAMAGED;" : "OVERALL=GOOD;") + damageSummary
        );

        if (anyDamage) {
            booking.setStatus("DAMAGE_DETECTED");
            booking.setPenaltyAmount(maxSeverity * 10);
        } else {
            booking.setStatus("COMPLETED");
            booking.setPenaltyAmount(0);
        }

        bookingRepository.save(booking);

        return ResponseEntity.ok(booking.getMlResult());
    }

    // ==================================================
    // 🔐 AUTH HELPERS
    // ==================================================
    private User authenticateDealer(String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"DEALER".equals(user.getRole()) || !user.isActive()) {
            throw new RuntimeException("Dealer access only");
        }

        return user;
    }

    private Booking getDealerBooking(String bookingId, User dealer) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!dealer.getId().equals(booking.getDealerId())) {
            throw new RuntimeException("Access denied");
        }

        return booking;
    }

    // ==================================================
    // 🔧 IMAGE SAVE HELPER
    // ==================================================
    private List<String> saveImages(
            MultipartFile[] images,
            String baseDir
    ) throws Exception {

        File dir = new File(baseDir);
        if (!dir.exists()) dir.mkdirs();

        List<String> paths = new ArrayList<>();

        for (MultipartFile img : images) {
            String filename = System.currentTimeMillis() + "_" + img.getOriginalFilename();
            Path path = Paths.get(baseDir + filename);
            Files.write(path, img.getBytes());
            paths.add(path.toString());
        }

        return paths;
    }
}
