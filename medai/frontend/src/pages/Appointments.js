import React, { useState } from "react";

export default function Appointments() {
  const [form, setForm] = useState({
    name: "",
    doctor: "",
    date: "",
    time: "",
    problem: "",
  });

  const [appointments, setAppointments] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const bookAppointment = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.doctor ||
      !form.date ||
      !form.time ||
      !form.problem
    ) {
      alert("Please fill all fields");
      return;
    }

    setAppointments([...appointments, form]);

    alert("Appointment Booked Successfully ✅");

    setForm({
      name: "",
      doctor: "",
      date: "",
      time: "",
      problem: "",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "30px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        📅 Book Appointment
      </h1>

      <form
        onSubmit={bookAppointment}
        style={{
          maxWidth: "500px",
          margin: "auto",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "15px",
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="doctor"
          placeholder="Doctor Name"
          value={form.doctor}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          style={inputStyle}
        />

        <textarea
          name="problem"
          placeholder="Describe Problem"
          value={form.problem}
          onChange={handleChange}
          style={{ ...inputStyle, height: "80px" }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#06b6d4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Book Now
        </button>
      </form>

      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        📌 Your Appointments
      </h2>

      <div style={{ maxWidth: "700px", margin: "20px auto" }}>
        {appointments.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>
            No appointments booked yet.
          </p>
        ) : (
          appointments.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#1e293b",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "12px",
              }}
            >
              <h3>{item.name}</h3>
              <p>👨‍⚕️ Doctor: {item.doctor}</p>
              <p>📅 Date: {item.date}</p>
              <p>⏰ Time: {item.time}</p>
              <p>🩺 Problem: {item.problem}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
};