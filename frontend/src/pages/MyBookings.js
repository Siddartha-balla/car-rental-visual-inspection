import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8082/api/bookings/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setBookings(data))
      .catch(() => alert("Error loading bookings"));
  }, [navigate]);

  // ================================
  // CANCEL BOOKING
  // ================================
  const cancelBooking = (bookingId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    fetch(`http://localhost:8082/api/bookings/${bookingId}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        alert("Booking cancelled successfully");

        // Update UI without reloading
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "CANCELLED" } : b
          )
        );
      })
      .catch(() => alert("Cancellation failed"));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-center">No bookings found</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Car</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.carName}</td>
                  <td>{b.startDate}</td>
                  <td>{b.endDate}</td>
                  <td>₹{b.totalPrice}</td>

                  <td>
                    <span
                      className={`badge ${
                        b.status === "BOOKED"
                          ? "bg-success"
                          : b.status === "CANCELLED"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td>
                    {b.status === "BOOKED" ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => cancelBooking(b.id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled
                      >
                        Not Allowed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
