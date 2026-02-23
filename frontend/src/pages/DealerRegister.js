import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function DealerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8082/api/dealers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Dealer registration failed");
      }

      alert(
        "Dealer registration submitted. Please wait for admin approval."
      );
      navigate("/login");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-1">Dealer Registration</h3>
        <p className="text-center text-muted mb-3" style={{ fontSize: "14px" }}>
          Register to list your cars for rent
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              className="form-control"
              name="name"
              placeholder="Dealer Name"
              onChange={handleChange}
              value={form.name}
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              value={form.email}
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
            />
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Register as Dealer"}
          </button>
        </form>

        <p className="text-center mt-3">
          Already approved? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default DealerRegister;
