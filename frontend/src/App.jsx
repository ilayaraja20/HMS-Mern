import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense, useContext } from "react";
import { AuthContext } from "./context/AuthStore";

const Home = lazy(() => import("./pages/Home"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const UserPayments = lazy(() => import("./pages/UserPayments"));
const UserComplaints = lazy(() => import("./pages/UserComplaints"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Rooms = lazy(() => import("./pages/Rooms"));
const Payments = lazy(() => import("./pages/Payments"));
const Complaints = lazy(() => import("./pages/Complaints"));

const PageFallback = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

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
      <Suspense fallback={<PageFallback />}>
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
                <UserComplaints />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
