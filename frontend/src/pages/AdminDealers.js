import React, { useEffect, useState } from "react";

function AdminDealers() {
  const [dealers, setDealers] = useState([]);
  const token = localStorage.getItem("token");

  // ================================
  // FETCH DEALERS
  // ================================
  const fetchDealers = async () => {
    try {
      const res = await fetch(
        "http://localhost:8082/api/admin/dealers",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch dealers");
      }

      const data = await res.json();
      setDealers(data);
    } catch (err) {
      alert("Error loading dealers");
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // ================================
  // ENABLE / DISABLE DEALER
  // ================================
  const toggleDealerStatus = async (dealerId, active) => {
    try {
      const res = await fetch(
        `http://localhost:8082/api/admin/dealers/${dealerId}/status?active=${active}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      fetchDealers();
    } catch (err) {
      alert("Failed to update dealer status");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Dealer Management</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dealers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No dealers found
                </td>
              </tr>
            )}

            {dealers.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.email}</td>
                <td>
                  <span
                    className={`badge ${
                      d.active ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {d.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>
                  {d.active ? (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        toggleDealerStatus(d.id, false)
                      }
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() =>
                        toggleDealerStatus(d.id, true)
                      }
                    >
                      Enable
                    </button>
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

export default AdminDealers;
