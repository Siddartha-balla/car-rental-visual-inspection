import React, { useEffect, useState, useCallback } from "react";

function DealerCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    carName: "",
    brand: "",
    model: "",
    fuelType: "",
    transmission: "",
    seats: "",
    pricePerDay: ""
  });

  const token = localStorage.getItem("token");

  // ================================
  // FETCH DEALER CARS
  // ================================
  const fetchCars = useCallback(async () => {
  try {
    const res = await fetch("http://localhost:8082/api/cars", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setCars(data);
  } catch (err) {
    alert("Failed to load cars");
  }
}, [token]);


  useEffect(() => {
  fetchCars();
}, [fetchCars]);


  // ================================
  // FORM HANDLING
  // ================================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload car image");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      formData.append(key, value)
    );
    formData.append("seats", Number(form.seats));
    formData.append("pricePerDay", Number(form.pricePerDay));
    formData.append("image", imageFile);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8082/api/cars", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const text = await res.text();

      if (!res.ok) {
        alert(text || "Failed to add car");
        return;
      }

      alert("Car added successfully");
      setForm({
        carName: "",
        brand: "",
        model: "",
        fuelType: "",
        transmission: "",
        seats: "",
        pricePerDay: ""
      });
      setImageFile(null);

      fetchCars();

    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">My Cars</h2>

      {/* ADD CAR */}
      <div className="card p-3 mb-4 shadow">
        <h5>Add New Car</h5>

        <form onSubmit={handleSubmit}>
          <div className="row">
            {[
              ["carName", "Car Name"],
              ["brand", "Brand"],
              ["model", "Model"],
              ["fuelType", "Fuel Type"],
              ["transmission", "Transmission"],
              ["seats", "Seats"],
              ["pricePerDay", "Price / Day"]
            ].map(([name, label]) => (
              <div className="col-md-3 mb-2" key={name}>
                <input
                  className="form-control"
                  name={name}
                  placeholder={label}
                  value={form[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            {/* IMAGE FILE */}
            <div className="col-md-3 mb-2">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                required
              />
            </div>
          </div>

          <button className="btn btn-primary mt-2" disabled={loading}>
            {loading ? "Adding..." : "Add Car"}
          </button>
        </form>
      </div>

      {/* CAR LIST */}
      <div className="row">
        {cars.map((car) => (
          <div className="col-md-4 mb-3" key={car.id}>
            <div className="card shadow h-100">
              <img
                src={`http://localhost:8082/uploads/cars/${car.imageUrl}`}
                className="card-img-top"
                alt={car.carName}
                height="200"
              />
              <div className="card-body">
                <h5>{car.carName}</h5>
                <p>{car.brand} • {car.model}</p>
                <p>₹{car.pricePerDay} / day</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DealerCars;
