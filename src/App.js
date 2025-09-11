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
import MapViewPage from "./pages/MapViewPage";
import DummyPage from "./pages/DummyPage";
import SwipedListPage from "./pages/SwipedListPage";
import RegistrationPage from "./pages/RegistrationPage";
import AdminResetPage from "./pages/AdminResetPage";
import PhotoUploadPage from "./pages/PhotoUploadPage";
import AllUsersPage from "./pages/AllUsersPage";
import RouteAssignPage from "./pages/RouteAssignPage";
import AllRoutesPage from "./pages/AllRoutesPage";
import StudentRegistrationPage from "./pages/registration/StudentRegistrationPage";
import DriverRegistrationPage from "./pages/registration/DriverRegistrationPage";
import ParentRegistrationPage from "./pages/registration/ParentRegistrationPage";
import AttenderRegistrationPage from "./pages/registration/AttenderRegistrationPage";
import RouteRegistrationPage from "./pages/registration/RouteRegistrationPage";
import RoutePointRegistrationPage from "./pages/registration/RoutePointRegistrationPage";
import SchoolRegistrationPage from "./pages/registration/SchoolRegistrationPage";
import AdminRegistrationPage from "./pages/registration/AdminRegistrationPage";
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
          <Route path="/map-view" element={<MapViewPage />} />
          
          {/* Dummy Pages for Dashboard Items */}
          <Route path="/swiped-list" element={<SwipedListPage />} />
          <Route path="/end-to-end-swipe" element={<SwipedListPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/admin-reset" element={<AdminResetPage />} />
          <Route path="/photo-upload" element={<PhotoUploadPage />} />
          <Route path="/by-route" element={<MapViewPage />} />
          <Route path="/all-users" element={<AllUsersPage />} />
          <Route path="/driver-tracker" element={<DummyPage />} />
          <Route path="/route-assign" element={<RouteAssignPage />} />
          
          {/* Registration Routes */}
          <Route path="/registration/student" element={<StudentRegistrationPage />} />
          <Route path="/registration/driver" element={<DriverRegistrationPage />} />
          <Route path="/registration/parent" element={<ParentRegistrationPage />} />
          <Route path="/registration/attender" element={<AttenderRegistrationPage />} />
          <Route path="/registration/route" element={<RouteRegistrationPage />} />
          <Route path="/registration/routepoint" element={<RoutePointRegistrationPage />} />
          <Route path="/registration/school" element={<SchoolRegistrationPage />} />
          <Route path="/registration/admin" element={<AdminRegistrationPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;