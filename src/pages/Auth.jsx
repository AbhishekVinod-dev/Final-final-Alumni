// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get role from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.role === "admin") navigate("/directory");
        else if (data.role === "student") navigate("/directory");
        else if (data.role === "alumni") navigate("/directory");
      } else {
        setError("No role info found. Please register again.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-6">Login</h1>

      <form
        onSubmit={handleLogin}
        className="w-96 bg-gray-800 p-6 rounded-lg shadow space-y-4"
      >
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          
          className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>

        {/* ✅ Navigate to registration page */}
        <button
          type="button"
          onClick={() => navigate("/Register")}
          className="w-full py-2 bg-green-600 rounded-lg hover:bg-green-700"
        >
          Sign Up
        </button>
        {/* <h1>
          type="text"
          
          onClick={() => navigate("/sendPasswordResetEmail")}
          className="w-full py-2 bg-green-600 rounded-lg hover:bg-green-700"
        
          Reset Password
        </h1> */}
        <p
  onClick={() => navigate("/sendPasswordResetEmail")}
 className="text-red-500 hover:text-red-600 cursor-pointer font-medium"
>
  Reset Password
</p>

        
      </form>
    </div>
  );
}
