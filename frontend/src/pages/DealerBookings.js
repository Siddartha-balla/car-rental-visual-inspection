import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DealerBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // ================================
  // FETCH DEALER BOOKINGS
  // ================================
  const fetchBookings = async () => {
    try {
      const res = await fetch(
        "http://localhost:8082/api/bookings/dealer",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await res.json();
      setBookings(data);

    } catch (err) {
      alert("Error loading dealer bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "BOOKED":
        return "bg-warning";
      case "ONGOING":
        return "bg-primary";
      case "COMPLETED":
        return "bg-success";
      case "DAMAGE_DETECTED":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">My Bookings</h2>

      {bookings.length === 0 && (
        <p className="text-muted">No bookings found</p>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Car</th>
              <th>User</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Inspection</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.carName}</td>
                <td>{b.userEmail}</td>
                <td>
                  {b.startDate} → {b.endDate}
                </td>
                <td>
                  <span className={`badge ${getStatusBadge(b.status)}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {(b.status === "BOOKED" || b.status === "ONGOING") && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        navigate(`/dealer/inspection/${b.id}`)
                      }
                    >
                      Inspect
                    </button>
                  )}

                  {(b.status === "COMPLETED" ||
                    b.status === "DAMAGE_DETECTED") && (
                    <span className="text-muted">Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DealerBookings;
