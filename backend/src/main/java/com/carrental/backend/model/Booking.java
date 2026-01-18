package com.carrental.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String userEmail;
    private String carId;
    private String carName;

    private LocalDate startDate;
    private LocalDate endDate;

    private double totalPrice;
    private String status; // BOOKED, ONGOING, COMPLETED, DAMAGE_DETECTED

    // 📸 Inspection images
    private List<String> pickupImages;   // admin before rental
    private List<String> returnImages;   // admin after return

    // 🤖 ML results
    private String mlResult;             // OK / DAMAGE
    private double damageScore;          // severity score from ML

    // 💰 Penalty (NEW)
    private double penaltyAmount;        // calculated based on severity
}
