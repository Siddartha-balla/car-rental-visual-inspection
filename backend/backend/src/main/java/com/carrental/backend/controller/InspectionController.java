package com.carrental.backend.controller;

import com.carrental.backend.service.DamageInspectionService;
import com.carrental.backend.dto.DamagePredictionResponse;
import com.carrental.backend.model.Booking;
import com.carrental.backend.repository.BookingRepository;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.File;
import java.io.IOException;
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

    // 📂 Image storage directories
    private static final String PICKUP_DIR = "uploads/inspection/pickup/";
    private static final String RETURN_DIR = "uploads/inspection/return/";

    public InspectionController(
            BookingRepository bookingRepository,
            DamageInspectionService damageInspectionService
    ) {
        this.bookingRepository = bookingRepository;
        this.damageInspectionService = damageInspectionService;
    }

    // ==================================================
    // 🔥 ML VALIDATION (CAR CHECK ONLY – SAFE)
    // ==================================================
    private boolean validateImageWithML(MultipartFile image, String side) throws IOException {

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
            // ❌ HARD FAIL ONLY IF NOT A CAR
            return false;
        } catch (Exception e) {
            // ⚠️ Any other ML uncertainty → allow upload
//            System.out.println("⚠ ML side check uncertain for: " + side);
            return true;
        }
    }

    // ==================================================
    // ✅ PICKUP INSPECTION (ADMIN)
    // BOOKED → ONGOING
    // ==================================================
    @PostMapping("/pickup/{bookingId}")
    public ResponseEntity<?> pickupInspection(
            @PathVariable String bookingId,
            @RequestParam("images") MultipartFile[] images
    ) throws Exception {

        if (images.length != 4) {
            return ResponseEntity.badRequest()
                    .body("Upload all 4 side images (FRONT, LEFT, BACK, RIGHT)");
        }

        String[] sides = {"FRONT", "LEFT", "BACK", "RIGHT"};

        // 🔥 ML VALIDATION (BEFORE SAVE)
        for (int i = 0; i < 4; i++) {
            boolean valid = validateImageWithML(images[i], sides[i]);
            if (!valid) {
                return ResponseEntity
                        .badRequest()
                        .body("Invalid image for side: " + sides[i]);

            }
        }


        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        List<String> savedImages = saveImages(images, PICKUP_DIR);

        booking.setPickupImages(savedImages);
        booking.setStatus("ONGOING");
        bookingRepository.save(booking);

        return ResponseEntity.ok("Pickup inspection completed");
    }

    // ==================================================
    // ✅ RETURN INSPECTION (ADMIN)
    // Uses REAL ML DAMAGE MODEL
    // ==================================================
    @PostMapping("/return/{bookingId}")
    public ResponseEntity<?> returnInspection(
            @PathVariable String bookingId,
            @RequestParam("images") MultipartFile[] images
    ) throws Exception {

        if (images.length != 4) {
            return ResponseEntity.badRequest()
                    .body("Upload all 4 side images (FRONT, LEFT, BACK, RIGHT)");
        }

        String[] sides = {"FRONT", "LEFT", "BACK", "RIGHT"};

        // 🔥 ML VALIDATION (CAR CHECK)
        for (int i = 0; i < 4; i++) {
            boolean valid = validateImageWithML(images[i], sides[i]);
            if (!valid) {
                return ResponseEntity
                        .badRequest()
                        .body("Invalid image for side: " + sides[i]);

            }
        }


        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        List<String> savedImages = saveImages(images, RETURN_DIR);

        StringBuilder damageSummary = new StringBuilder();
        boolean anyDamage = false;
        double maxSeverity = 0;

        // 🔥 SIDE-WISE DAMAGE COMPARISON
        for (int i = 0; i < 4; i++) {

            File beforeImage = new File(booking.getPickupImages().get(i));
            File afterImage = new File(savedImages.get(i));

            DamagePredictionResponse response =
                    damageInspectionService.inspectDamage(beforeImage, afterImage);

            double probability = response.getDamage_probability();
            double severity = response.getSeverity();

            boolean damaged = probability > 0.5 && severity > 15;


            damageSummary.append(
                    sides[i] + "=" +
                            (damaged ? "DAMAGED" : "GOOD") +
                            "(" + Math.round(severity) + ");"
            );

            if (damaged) {
                anyDamage = true;
                maxSeverity = Math.max(maxSeverity, severity);
            }
        }

        // ✅ FINAL RESULT
        String overall = anyDamage ? "OVERALL=DAMAGED;" : "OVERALL=GOOD;";
        String finalResult = overall + damageSummary;

        booking.setReturnImages(savedImages);
        booking.setMlResult(finalResult);
        booking.setDamageScore(maxSeverity);

        if (anyDamage) {
            booking.setStatus("DAMAGE_DETECTED");
            booking.setPenaltyAmount(maxSeverity * 10);
        } else {
            booking.setStatus("COMPLETED");
            booking.setPenaltyAmount(0);
        }

        bookingRepository.save(booking);

        return ResponseEntity.ok(finalResult);
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
