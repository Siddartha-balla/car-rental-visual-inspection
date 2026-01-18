package com.carrental.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "cars")
public class Car {

    @Id
    private String id;

    private String carName;
    private String brand;
    private String model;
    private String fuelType;
    private String transmission;
    private int seats;
    private double pricePerDay;
    private String imageUrl;
    private boolean available = true;
}
