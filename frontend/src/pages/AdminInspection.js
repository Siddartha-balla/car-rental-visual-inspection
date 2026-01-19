import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminInspection() {
  const [bookings, setBookings] = useState([]);
  const [result, setResult] = useState("");
  const [pickupImages, setPickupImages] = useState({});
  const [returnImages, setReturnImages] = useState({});
  const [selectedSide, setSelectedSide] = useState(null);
  const [modalImages, setModalImages] = useState({ pickup: "", return: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const SIDES = ["FRONT", "LEFT", "BACK", "RIGHT"];

  /* ================= AUTH + FETCH ================= */
  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/");
      return;
    }

    fetch("http://localhost:8082/api/bookings/admin", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setBookings)
      .catch(() => alert("Failed to load bookings"));
  }, [navigate, token, role]);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImages = async (bookingId, type, imagesObj) => {
  const files = Object.values(imagesObj);

  if (files.length !== 4 || files.includes(undefined)) {
    alert("Upload all 4 images (Front, Left, Back, Right)");
    return;
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const url =
    type === "pickup"
      ? `http://localhost:8082/api/inspection/pickup/${bookingId}`
      : `http://localhost:8082/api/inspection/return/${bookingId}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const msg = await res.text();

    if (!res.ok) {
      alert(msg); // 🔥 shows ML rejection message
      return;
    }

    alert(msg);
    window.location.reload();
  } catch {
    alert("Server error");
  }
};


  /* ================= INPUTS ================= */
  const imageInputs = (setter, state) =>
    SIDES.map((side) => (
      <div className="col-md-3 mb-2" key={side}>
        <label className="form-label">{side}</label>
        <input
          type="file"
          accept="image/*"
          className="form-control"
          onChange={(e) =>
            setter({ ...state, [side]: e.target.files[0] })
          }
        />
      </div>
    ));

  /* ================= DAMAGE RESULT ================= */
  const renderSideWiseResult = (mlResult) => {
    if (!mlResult) return null;

    return (
      <ul className="list-group mt-2">
        {mlResult.split(";").filter(Boolean).map((p, i) => {
          const isDamage = p.includes("DAMAGED");
          return (
            <li
              key={i}
              className={`list-group-item d-flex justify-content-between ${
                isDamage ? "list-group-item-danger" : "list-group-item-success"
              }`}
            >
              <span>{p.split("=")[0]}</span>
              <strong>{isDamage ? "DAMAGED" : "GOOD"}</strong>
            </li>
          );
        })}
      </ul>
    );
  };

  /* ================= SIDE-BY-SIDE GRID ================= */
  const renderComparisonGrid = (pickupImgs, returnImgs) => (
    <div className="row g-3">
      {SIDES.map((side, i) => (
        <div className="col-md-3" key={side}>
          <div
            className="border rounded p-2 shadow-sm text-center"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedSide(side);
              setModalImages({
                pickup: `http://localhost:8082/${pickupImgs[i]}`,
                return: `http://localhost:8082/${returnImgs[i]}`,
              });
            }}
          >
            <strong>{side}</strong>
            <div className="d-flex gap-1 mt-2">
              <img
                src={`http://localhost:8082/${pickupImgs[i]}`}
                alt="pickup"
                style={{ width: "50%", height: "80px", objectFit: "cover" }}
                className="rounded"
              />
              <img
                src={`http://localhost:8082/${returnImgs[i]}`}
                alt="return"
                style={{ width: "50%", height: "80px", objectFit: "cover" }}
                className="rounded"
              />
            </div>
            <small className="text-muted">Click to enlarge</small>
          </div>
        </div>
      ))}
    </div>
  );

  /* ================= UI ================= */
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Inspection Panel</h2>

      {bookings.map((b) => (
        <div className="card mb-4 shadow" key={b.id}>
          <div className="card-body">
            <h5>{b.carName}</h5>
            <p>
              <strong>User:</strong> {b.userEmail} <br />
              <strong>Status:</strong>{" "}
              <span className="badge bg-info">{b.status}</span>
            </p>

            {/* DAMAGE RESULT */}
            {b.mlResult && (
              <>
                <h6>Damage Report</h6>
                {renderSideWiseResult(b.mlResult)}
              </>
            )}

            {/* IMAGE COMPARISON */}
            {b.pickupImages && b.returnImages && (
              <>
                <h6 className="mt-3">Pickup vs Return Comparison</h6>
                {renderComparisonGrid(b.pickupImages, b.returnImages)}
              </>
            )}

            {/* PICKUP */}
            {b.status === "BOOKED" && (
              <>
                <h6 className="mt-3">Pickup Inspection</h6>
                <div className="row">{imageInputs(setPickupImages, pickupImages)}</div>
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => uploadImages(b.id, "pickup", pickupImages)}
                >
                  Submit Pickup
                </button>
              </>
            )}

            {/* RETURN */}
            {b.status === "ONGOING" && (
              <>
                <h6 className="mt-3">Return Inspection</h6>
                <div className="row">{imageInputs(setReturnImages, returnImages)}</div>
                <button
                  className="btn btn-danger mt-2"
                  onClick={() => uploadImages(b.id, "return", returnImages)}
                >
                  Submit Return
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* MODAL */}
      {selectedSide && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{selectedSide} – Comparison</h5>
                <button className="btn-close" onClick={() => setSelectedSide(null)} />
              </div>
              <div className="modal-body d-flex gap-3">
                <div className="w-50 text-center">
                  <h6>Pickup</h6>
                  <img src={modalImages.pickup} className="img-fluid rounded shadow" />
                </div>
                <div className="w-50 text-center">
                  <h6>Return</h6>
                  <img src={modalImages.return} className="img-fluid rounded shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInspection;
