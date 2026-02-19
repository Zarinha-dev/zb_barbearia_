// App.tsx
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BookAppointment from "@/pages/BookAppointment";
import MyBookings from "@/pages/MyBookings";
import AdminDashboard from "@/pages/AdminDashboard";
import { seedIfNeeded } from "@/lib/storage";

export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {
    seedIfNeeded();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar page={page} setPage={setPage} />

      {page === "home" && <Home setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "register" && <Register setPage={setPage} />}
      {page === "book" && <BookAppointment setPage={setPage} />}
      {page === "my" && <MyBookings setPage={setPage} />}
      {page === "admin" && <AdminDashboard />}
    </div>
  );
}
