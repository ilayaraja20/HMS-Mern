import { useContext, useState } from "react";
import api from "../services/api";
import { Alert, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { AuthContext } from "../context/AuthStore";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { adminLogin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter admin email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/admin/login", {
        email,
        password,
      });

      if (res.data?.token && res.data?.admin) {
        setSuccessMessage(res.data.message || "Login successful");
        adminLogin(res.data.token);
        setTimeout(() => {
          navigate("/dashboard");
        }, 900);
      } else {
        setErrorMessage("Unexpected login response from server.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Administrator Secure Login"
      subtitle="Sign in as hostel admin to manage students, rooms, payments, and operational complaints."
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Admin Access
      </Typography>
      <Typography variant="body2" sx={{ color: "#5b6f6b", mb: 2 }}>
        Only authorized administrators should access this dashboard.
      </Typography>

      {errorMessage && <Alert severity="error" sx={{ mb: 1.5 }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 1.5 }}>{successMessage}</Alert>}

      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading}
          sx={{ mt: 2, py: 1.2, background: "#0c6b61" }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Secure Admin Login"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default AdminLogin;

