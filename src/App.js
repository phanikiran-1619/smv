import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OTPVerification from "./pages/OTPVerification";
import ResetPassword from "./pages/ResetPassword";
import ParentDashboard from "./pages/ParentDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import StudentMap from "./pages/StudentMap";
import DummyPage from "./pages/DummyPage";
import SwipedListPage from "./pages/SwipedListPage";
import RegistrationPage from "./pages/RegistrationPage";
import AdminResetPage from "./pages/AdminResetPage";
import PhotoUploadPage from "./pages/PhotoUploadPage";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login/:userType" element={<LoginPage />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
          <Route path="/dashboard/admin" element={<SchoolAdminDashboard />} />
          <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
          
          {/* Map Route */}
          <Route path="/student-map" element={<StudentMap />} />
          
          {/* Dummy Pages for Dashboard Items */}
          <Route path="/swiped-list" element={<SwipedListPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/admin-reset" element={<AdminResetPage />} />
          <Route path="/photo-upload" element={<PhotoUploadPage />} />
          <Route path="/by-route" element={<DummyPage />} />
          <Route path="/all-users" element={<DummyPage />} />
          <Route path="/driver-tracker" element={<DummyPage />} />
          <Route path="/end-to-end-swipe" element={<DummyPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;