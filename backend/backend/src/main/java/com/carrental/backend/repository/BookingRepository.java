package com.carrental.backend.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.carrental.backend.model.Booking;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserEmail(String userEmail);
}
