package com.carrental.backend.dto;

public class DamagePredictionResponse {

    private boolean damage;
    private double damage_probability;
    private double severity;

    // 🔹 REQUIRED: No-args constructor (Jackson)
    public DamagePredictionResponse() {
    }

    // 🔹 Getter & Setter for damage
    public boolean isDamage() {
        return damage;
    }

    public void setDamage(boolean damage) {
        this.damage = damage;
    }

    // 🔹 Getter & Setter for damage_probability
    public double getDamage_probability() {
        return damage_probability;
    }

    public void setDamage_probability(double damage_probability) {
        this.damage_probability = damage_probability;
    }

    // 🔹 Getter & Setter for severity
    public double getSeverity() {
        return severity;
    }

    public void setSeverity(double severity) {
        this.severity = severity;
    }
}
