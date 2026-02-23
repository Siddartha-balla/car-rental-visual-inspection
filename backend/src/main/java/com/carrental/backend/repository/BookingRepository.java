package com.carrental.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.carrental.backend.model.Booking;
import java.time.LocalDate;
import org.springframework.data.mongodb.repository.Query;
public interface BookingRepository extends MongoRepository<Booking, String> {

    // -------- USER --------
    List<Booking> findByUserEmail(String userEmail);

    // -------- DEALER --------
    List<Booking> findByDealerId(String dealerId);

    // -------- DEALER + STATUS (optional, future use) --------
    List<Booking> findByDealerIdAndStatus(String dealerId, String status);
    @Query("""
{
  carId: ?0,
  status: { $in: ["BOOKED", "ONGOING"] },
  startDate: { $lte: ?2 },
  endDate: { $gte: ?1 }
}
""")

    List<Booking> findConflictingBookings(
            String carId,
            LocalDate startDate,
            LocalDate endDate
    );

}
