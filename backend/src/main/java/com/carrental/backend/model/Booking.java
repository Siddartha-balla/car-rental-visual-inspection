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

    // -------- User Info --------
    private String userEmail;

    // -------- Car Info --------
    private String carId;
    private String carName;

    // -------- Dealer Info (NEW) --------
    /**
     * Dealer who owns the car and performs inspection
     */
    private String dealerId;
    private String dealerName;

    // -------- Booking Duration --------
    private LocalDate startDate;
    private LocalDate endDate;

    private double totalPrice;

    /**
     * BOOKED        -> user booked, pickup pending
     * ONGOING       -> pickup inspection done by dealer
     * COMPLETED     -> return inspection done, no damage
     * DAMAGE_FOUND  -> damage detected on return
     */
    private String status;

    // -------- Inspection Images (Dealer uploads) --------
    private List<String> pickupImages;   // dealer before rental
    private List<String> returnImages;   // dealer after return

    // -------- ML Results --------
    private String mlResult;             // OK / DAMAGE
    private double damageScore;          // severity score

    // -------- Penalty --------
    private double penaltyAmount;
}
