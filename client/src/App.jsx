
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import UserDashboard from "./pages/user/UserDashboard";
import GenerateToken from "./pages/user/GenerateToken";
import MyToken from "./pages/user/MyToken";

import StaffDashboard from "./pages/staff/StaffDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminServices from "./pages/admin/AdminServices";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User pages */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/generate-token" element={<GenerateToken />} />
        <Route path="/user/my-token" element={<MyToken />} />

        {/* Staff page */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />

        {/* Admin pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
