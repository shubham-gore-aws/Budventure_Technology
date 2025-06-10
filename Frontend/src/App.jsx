import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Component/Login/Login";
import Register from "./Component/Registration/Registrstion";
import Sticky from "./Component/Sticky/Sticky";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Sticky" element={<Sticky/>} />
      </Routes>
    </BrowserRouter>
  );
}
