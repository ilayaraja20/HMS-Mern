import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import Payments from "./pages/Payments";
import Complaints from "./pages/Complaints";
import UserPayments from "./pages/UserPayments";

function ProtectedRoute({ children }) {
  const { adminAuth } = useContext(AuthContext);
  return adminAuth ? children : <Navigate to="/admin-login" replace />;
}

function UserRoute({ children }) {
  const { userAuth } = useContext(AuthContext);
  return userAuth ? children : <Navigate to="/user-login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/user-login" element={<UserLogin />} />

        <Route
          path="/user-dashboard"
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          }
        />

        <Route
          path="/user-payments"
          element={
            <UserRoute>
              <UserPayments />
            </UserRoute>
          }
        />

        <Route
          path="/user-complaints"
          element={
            <UserRoute>
              <Navigate to="/user-dashboard" replace />
            </UserRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <Complaints />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
