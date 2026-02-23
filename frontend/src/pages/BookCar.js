import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function BookCar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    startDate: "",
    endDate: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 Auth check
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    // 📅 Date validation
    if (form.endDate < form.startDate) {
      setError("End date cannot be before start date");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8082/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: id,
          startDate: form.startDate,
          endDate: form.endDate
        })
      });

      if (response.ok) {
        alert("Booking successful");
        navigate("/");
      } else {
        // 🔥 Read backend message
        const message = await response.text();
        setError(
          message ||
            "This car is already booked for the selected dates"
        );
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-3">Book Car</h3>

      <form onSubmit={handleSubmit} className="card p-4 shadow">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <button
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default BookCar;
