import React from "react";
import { useNavigate } from "react-router-dom";

function DealerDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Dealer Dashboard</h2>
      <p className="text-muted">Welcome, {email}</p>

      <div className="row mt-4">
        {/* My Cars */}
        <div className="col-md-4 mb-3">
          <div className="card shadow h-100">
            <div className="card-body text-center">
              <h5 className="card-title">My Cars</h5>
              <p className="card-text">
                Add and manage your cars for rent
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/dealer/cars")}
              >
                Manage Cars
              </button>
            </div>
          </div>
        </div>

        {/* My Bookings */}
        <div className="col-md-4 mb-3">
          <div className="card shadow h-100">
            <div className="card-body text-center">
              <h5 className="card-title">My Bookings</h5>
              <p className="card-text">
                View bookings and perform inspections
              </p>
              <button
                className="btn btn-success"
                onClick={() => navigate("/dealer/bookings")}
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="col-md-4 mb-3">
          <div className="card shadow h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Logout</h5>
              <p className="card-text">
                Sign out from dealer account
              </p>
              <button
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealerDashboard;
