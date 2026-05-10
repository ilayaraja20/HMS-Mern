import { useContext, useState } from "react";
import api from "../services/api";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { AuthContext } from "../context/AuthStore";

function UserLogin() {
  const [tab, setTab] = useState(0);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userLogin } = useContext(AuthContext);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleRegister = async () => {
    clearMessages();

    if (!name || !regEmail || !regPassword || !confirmPassword) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (regPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/users/register", {
        name,
        email: regEmail,
        phone,
        password: regPassword,
      });

      setSuccessMessage(res.data.message || "Registration successful. Please login.");
      setTab(0);
      setName("");
      setRegEmail("");
      setPhone("");
      setRegPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clearMessages();

    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/users/login", {
        email: loginEmail,
        password: loginPassword,
      });

      if (res.data?.token && res.data?.user?._id) {
        setSuccessMessage(res.data.message || "Login successful");
        userLogin(res.data.token, res.data.user._id);
        setTimeout(() => {
          navigate("/user-dashboard");
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
      title="Student Portal Login & Registration"
      subtitle="Access your profile, payments, and complaints through a secure student account experience."
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Student Access
      </Typography>
      <Typography variant="body2" sx={{ color: "#5b6f6b", mb: 2 }}>
        Use your credentials to login or create a new student account.
      </Typography>

      {errorMessage && <Alert severity="error" sx={{ mb: 1.5 }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 1.5 }}>{successMessage}</Alert>}

      <Tabs value={tab} onChange={(e, val) => { clearMessages(); setTab(val); }}>
        <Tab label="Login" />
        <Tab label="Register" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2, py: 1.2, background: "#0c6b61" }}
            onClick={handleLogin}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Secure Login"}
          </Button>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2, py: 1.2, background: "#0c6b61" }}
            onClick={handleRegister}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create Account"}
          </Button>
        </Box>
      )}
    </AuthLayout>
  );
}

export default UserLogin;

