import React, { useState } from "react";

function AdminAddCar() {
  const [formData, setFormData] = useState({
    carName: "",
    brand: "",
    model: "",
    fuelType: "",
    transmission: "",
    seats: "",
    pricePerDay: ""
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload car image");
      return;
    }

    const data = new FormData();
    data.append("carName", formData.carName);
    data.append("brand", formData.brand);
    data.append("model", formData.model);
    data.append("fuelType", formData.fuelType);
    data.append("transmission", formData.transmission);
    data.append("seats", formData.seats);
    data.append("pricePerDay", formData.pricePerDay);
    data.append("image", image);

    try {
      const response = await fetch(
        "http://localhost:8082/api/admin/cars",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: data
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add car");
      }

      setMessage("✅ Car added successfully");
      setFormData({
        carName: "",
        brand: "",
        model: "",
        fuelType: "",
        transmission: "",
        seats: "",
        pricePerDay: ""
      });
      setImage(null);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error adding car");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin – Add New Car</h2>

      {message && (
        <div className="alert alert-info text-center">
          {message}
        </div>
      )}

      <form
        className="card shadow p-4"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Car Name</label>
            <input
              type="text"
              name="carName"
              className="form-control"
              value={formData.carName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              className="form-control"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Model</label>
            <input
              type="text"
              name="model"
              className="form-control"
              value={formData.model}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Fuel Type</label>
            <select
              name="fuelType"
              className="form-control"
              value={formData.fuelType}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label>Transmission</label>
            <select
              name="transmission"
              className="form-control"
              value={formData.transmission}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Manual</option>
              <option>Automatic</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label>Seats</label>
            <input
              type="number"
              name="seats"
              className="form-control"
              value={formData.seats}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3 mb-3">
            <label>Price / Day</label>
            <input
              type="number"
              name="pricePerDay"
              className="form-control"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-12 mb-3">
            <label>Car Image</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>
        </div>

        <button className="btn btn-success w-100 mt-3">
          Add Car
        </button>
      </form>
    </div>
  );
}

export default AdminAddCar;
