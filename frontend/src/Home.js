import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  // Fetch cars from backend
  useEffect(() => {
    fetch("http://localhost:8082/api/cars")
      .then((res) => res.json())
      .then((data) => setCars(data))
      .catch((err) => console.error("Error fetching cars:", err));
  }, []);

  return (
    <div>

      {/* ===== HERO SECTION ===== */}
      <div className="bg-dark text-white text-center py-5">
        <h1>Rent Your Dream Car</h1>
        <p className="lead">Affordable • Reliable • Easy Booking</p>

      </div>

      {/* ===== CARS SECTION ===== */}
      <div className="container mt-5">
        <h2 className="text-center mb-4">Available Cars</h2>

        <div className="row">
          {cars.map((car) => (
            <div className="col-md-3 mb-4" key={car.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={`http://localhost:8082/uploads/cars/${car.imageUrl}`}
                  className="card-img-top"
                  alt={car.carName}
                  style={{ height: "180px", objectFit: "cover" }}
                />

                <div className="card-body text-center">
                  <h5 className="card-title">{car.carName}</h5>
                  <p className="card-text">
                    ₹{car.pricePerDay} / day
                  </p>

                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#carModal"
                    onClick={() => setSelectedCar(car)}
                  >
                    View Details
                  </button>

                  <Link
  to={`/book/${car.id}`}
  className="btn btn-primary btn-sm"
>
  Rent Now
</Link>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      <div
        className="modal fade"
        id="carModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {selectedCar && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedCar.carName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body">
                  <img
                    src={`http://localhost:8082/uploads/cars/${selectedCar.imageUrl}`}
                    alt={selectedCar.carName}
                    className="img-fluid mb-3"
                  />

                  <p><strong>Brand:</strong> {selectedCar.brand}</p>
                  <p><strong>Fuel:</strong> {selectedCar.fuelType}</p>
                  <p><strong>Transmission:</strong> {selectedCar.transmission}</p>
                  <p><strong>Seats:</strong> {selectedCar.seats}</p>
                  <p>
                    <strong>Price:</strong> ₹{selectedCar.pricePerDay} / day
                  </p>
                </div>

                <div className="modal-footer">
                  <Link
                    to="/login"
                    className="btn btn-success"
                  >
                    Login to Rent
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="bg-light text-center py-3 mt-5">
        <p className="mb-0">
          © 2026 Car Rental System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;
