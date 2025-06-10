import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ initialize navigation

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); 

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Registration successful!");
        setFormData({ fullName: "", email: "", password: "" });
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong!");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/"); 
  };

  return (
    <div className="min-h-screen bg-slate-700 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex-1 flex justify-center">
          <div  className="w-full max-w-sm space-y-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 bg-transparent border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="w-full px-4 py-3 bg-transparent border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-transparent border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />

            <button
            onClick={handleSubmit}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition"
            >
              CREATE ACCOUNT
            </button>

            {message && (
              <div className="text-sm text-center text-white pt-2">{message}</div>
            )}

            <div className="text-sm text-slate-400 text-center pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={handleLogin}
                className="hover:text-slate-300 underline"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
