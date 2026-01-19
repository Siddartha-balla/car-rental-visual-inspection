import  React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

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

            {/* ADMIN MENU */}
            
            {token && role === "ADMIN" && (
  <>
    <li className="nav-item">
      <Link className="nav-link" to="/admin/add-car">
        Add Car
      </Link>
    </li>

    <li className="nav-item">
      <Link className="nav-link" to="/admin/bookings">
        View Bookings
      </Link>
    </li>

    <li className="nav-item">
      <Link className="nav-link" to="/admin/inspection">
        Inspection
      </Link>
    </li>
  </>
)}


            {/* NOT LOGGED IN */}
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
              </>
            )}

            {/* LOGGED IN */}
            {token && role !== "ADMIN" && (
  <li className="nav-item">
    <Link className="nav-link" to="/my-bookings">
      My Bookings
    </Link>
  </li>
)}
            {token && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm ms-2"
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
