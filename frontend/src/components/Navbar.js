import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toUpperCase();


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          CarRental
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            {/* ---------- NOT LOGGED IN ---------- */}
            {!token && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
                <li className="nav-item">
  <Link className="nav-link" to="/dealer-register">
    Dealer Register
  </Link>
</li>

              </>
            )}

            {/* ---------- USER ---------- */}
            {token && role === "CUSTOMER" && (
  <>
    <li className="nav-item">
      <Link className="nav-link" to="/">
        Home
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link" to="/my-bookings">
        My Bookings
      </Link>
    </li>
  </>
)}


            {/* ---------- DEALER ---------- */}
            {token && role === "DEALER" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dealer">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dealer/cars">
                    My Cars
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dealer/bookings">
                    Bookings
                  </Link>
                </li>
              </>
            )}

            {/* ---------- ADMIN ---------- */}
            {token && role === "ADMIN" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/bookings">
                    Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dealers">
                    Dealers
                  </Link>
                </li>
              </>
            )}

            {/* ---------- LOGOUT ---------- */}
            {token && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm ms-3"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
