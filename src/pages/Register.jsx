// src/pages/Register.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { email, password, ...extra } = formData;

      // Default values if not alumni
      if (role !== "alumni") {
        extra.company = "-";
        extra.batch = "-";
      }
      if (role !== "student") {
        extra.location = "-";
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save role & details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        role,
        email,
        ...extra,
      });

      // Redirect after registration
      navigate("/directory");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-6">Register As</h1>
        <div className="space-y-4 w-64">
          <button
            onClick={() => setRole("admin")}
            className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            College Admin
          </button>
          <button
            onClick={() => setRole("student")}
            className="w-full py-2 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Student
          </button>
          <button
            onClick={() => setRole("alumni")}
            className="w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Alumni
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-6">
        {role.charAt(0).toUpperCase() + role.slice(1)} Registration
      </h1>

      <form
        onSubmit={handleRegister}
        className="w-96 bg-gray-800 p-6 rounded-lg shadow space-y-4"
      >
        {/* Common fields */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="text"
          name="profession"
          placeholder="Profession"
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />

        {/* Alumni-only fields */}
        {role === "alumni" && (
          <>
            <input
              type="text"
              name="graduateYear"
              placeholder="Graduation Year"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="collegeName"
              placeholder="College Name"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="batch"
              placeholder="Batch (e.g. CSE-2018)"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="company"
              placeholder="Company"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
          </>
        )}

        {/* Admin-only field */}
        {role === "admin" && (
          <input
            type="text"
            name="employeeId"
            placeholder="Employee ID"
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        )}

        {/* Student-only fields */}
        {role === "student" && (
          <>
            <input
              type="text"
              name="registrationNo"
              placeholder="Registration No"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="batch"
              placeholder="Batch (e.g. CSE-2022)"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="yearToGraduate"
              placeholder="Year to Graduate"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="collegeName"
              placeholder="College Name"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
          </>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Register
        </button>
      </form>

      <button
        className="mt-4 text-sm text-gray-400"
        onClick={() => setRole("")}
      >
        ← Back to Role Selection
      </button>
    </div>
  );
}
