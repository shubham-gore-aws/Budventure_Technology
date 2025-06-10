import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Login successful!");
        localStorage.setItem("token", data.token); 
        navigate("/Sticky"); 
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong!");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-slate-700 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl flex items-center justify-between">
        
        <div className="flex-1 flex justify-center">
          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
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
              type="submit"
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition"
            >
              CONNECT
            </button>

            {message && (
              <div className="text-sm text-center text-white pt-2">{message}</div>
            )}

            <div className="flex justify-center text-sm text-slate-400 pt-2">
              <button
                type="button"
                onClick={handleRegister}
                className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
