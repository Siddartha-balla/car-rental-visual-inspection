import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function BookCar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    startDate: "",
    endDate: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

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
      alert("Booking failed");
    }
  };

  return (
    <div className="container mt-5">
      <h3>Book Car</h3>

      <form onSubmit={handleSubmit} className="card p-4 shadow">
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

        <button className="btn btn-success">
          Confirm Booking
        </button>
      </form>
    </div>
  );
}

export default BookCar;
