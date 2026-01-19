import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRoute from "./components/AdminRoute";
import AdminAddCar from "./pages/AdminAddCar";
import Navbar from "./components/Navbar";
import Home from "./Home";
import BookCar from "./pages/BookCar";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import AdminInspection from "./pages/AdminInspection";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<BookCar />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route
  path="/admin/inspection"
  element={
    <AdminRoute>
      <AdminInspection />
    </AdminRoute>
  }
/>
        <Route
  path="/admin/bookings"
  element={
    <AdminRoute>
      <AdminBookings />
    </AdminRoute>
  }
/>

        <Route
          path="/admin/add-car"
          element={
            <AdminRoute>
              <AdminAddCar />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
