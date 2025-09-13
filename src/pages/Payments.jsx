// src/pages/Payments.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import demoPaymentImage from "../assets/payment-screenshot.jpg"; // Add your demo screenshot here

export default function Payments() {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Demo Payment Page</h1>

      <p className="mb-4 text-gray-300">
        This is a demo page for donations. The payment gateway is shown below.
      </p>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center gap-4">
        <img
          src={demoPaymentImage}
          alt="Payment Gateway Demo"
          className="w-full max-w-md rounded-lg border border-gray-700"
        />
        
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          onClick={() => alert("Donation initiated!")}
        >
          Donate Now 
        </button>
      </div>

      <button
        className="mt-6 underline text-gray-400"
        onClick={() => window.history.back()}
      >
        ← Back
      </button>
    </div>
  );
}
