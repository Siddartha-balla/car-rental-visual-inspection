import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function DealerInspection() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [type, setType] = useState("pickup"); // pickup | return
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================================
  // HANDLE IMAGE SELECT
  // ================================
  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  // ================================
  // SUBMIT INSPECTION
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length !== 4) {
      alert("Please upload exactly 4 images (Front, Left, Back, Right)");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8082/api/inspection/${type}/${bookingId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const text = await res.text();

      if (!res.ok) {
        alert(text || "Inspection failed");
        setLoading(false);
        return;
      }

      alert(
        type === "pickup"
          ? "Pickup inspection completed"
          : "Return inspection completed"
      );

      navigate("/dealer/bookings");

    } catch (err) {
      alert("Server error during inspection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Vehicle Inspection</h2>

      <div className="card p-3 shadow">
        <form onSubmit={handleSubmit}>
          {/* Inspection Type */}
          <div className="mb-3">
            <label className="form-label">Inspection Type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="pickup">Pickup Inspection</option>
              <option value="return">Return Inspection</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="mb-3">
            <label className="form-label">
              Upload 4 Images (Front, Left, Back, Right)
            </label>
            <input
              type="file"
              className="form-control"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Submit Inspection"}
          </button>

          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/dealer/bookings")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default DealerInspection;
