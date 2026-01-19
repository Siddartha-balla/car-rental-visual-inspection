import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      navigate("/");
      return;
    }

    fetch("http://localhost:8082/api/bookings/admin", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Access denied");
        }
        return res.json();
      })
      .then((data) => setBookings(data))
      .catch(() => alert("Failed to load bookings"));
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">All Bookings (Admin)</h2>

      {bookings.length === 0 ? (
        <p className="text-center">No bookings available</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>User Email</th>
                <th>Car</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.userEmail}</td>
                  <td>{b.carName}</td>
                  <td>{b.startDate}</td>
                  <td>{b.endDate}</td>
                  <td>₹{b.totalPrice}</td>
                  <td>
                    <span className="badge bg-success">
                      {b.status}
                    </span>
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

export default AdminBookings;
