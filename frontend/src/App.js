import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DealerRegister from "./pages/DealerRegister";


import AdminRoute from "./components/AdminRoute";
import DealerRoute from "./components/DealerRoute";

import Navbar from "./components/Navbar";

import Home from "./Home";
import BookCar from "./pages/BookCar";
import MyBookings from "./pages/MyBookings";

// ADMIN PAGES
import AdminBookings from "./pages/AdminBookings";
import AdminDealers from "./pages/AdminDealers";

// DEALER PAGES
import DealerDashboard from "./pages/DealerDashboard";
import DealerCars from "./pages/DealerCars";
import DealerBookings from "./pages/DealerBookings";
import DealerInspection from "./pages/DealerInspection";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ---------- PUBLIC / USER ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<BookCar />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* ---------- ADMIN ---------- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />
        <Route path="/dealer-register" element={<DealerRegister />} />

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/dealers"
          element={
            <AdminRoute>
              <AdminDealers />
            </AdminRoute>
          }
        />

        {/* ---------- DEALER ---------- */}
        <Route
          path="/dealer"
          element={
            <DealerRoute>
              <DealerDashboard />
            </DealerRoute>
          }
        />

        <Route
          path="/dealer/cars"
          element={
            <DealerRoute>
              <DealerCars />
            </DealerRoute>
          }
        />

        <Route
          path="/dealer/bookings"
          element={
            <DealerRoute>
              <DealerBookings />
            </DealerRoute>
          }
        />

        <Route
          path="/dealer/inspection/:bookingId"
          element={
            <DealerRoute>
              <DealerInspection />
            </DealerRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
