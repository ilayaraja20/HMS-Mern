import { AppBar, Box, Button, Chip, Stack, Toolbar, Typography } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthStore";
import { useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Admin Dashboard",
  "/students": "Student Management",
  "/rooms": "Room Allocation",
  "/payments": "Payment Operations",
  "/complaints": "Complaint Center",
  "/user-dashboard": "Student Dashboard",
  "/user-payments": "My Payments",
};

function Topbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const activeRole = localStorage.getItem("activeRole");

  const pageTitle = useMemo(() => {
    return pageTitles[location.pathname] || "Hostel Management System";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate(activeRole === "user" ? "/user-login" : "/admin-login");
  };

  return (
    <AppBar position="sticky" color="transparent" sx={{ px: { xs: 1.2, md: 2.6 }, pt: { xs: 1.2, md: 2 } }}>
      <Toolbar
        sx={{
          borderRadius: 3,
          border: "1px solid #d7e3ee",
          background: "rgba(255,255,255,0.86)",
          backdropFilter: "blur(10px)",
          minHeight: "68px",
          justifyContent: "space-between",
          px: { xs: 1.3, md: 2 },
        }}
      >
        <Stack spacing={0.4}>
          <Typography
            variant="caption"
            sx={{ color: "#647a91", letterSpacing: 0.4, fontWeight: 700, textTransform: "uppercase" }}
          >
            Hostel Management System
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {pageTitle}
            </Typography>
            <Chip
              size="small"
              label={activeRole === "user" ? "Student Access" : "Admin Access"}
              color={activeRole === "user" ? "secondary" : "primary"}
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<HomeRoundedIcon />} onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="contained" color="error" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Toolbar>
      <Box sx={{ height: { xs: 8, md: 12 } }} />
    </AppBar>
  );
}

export default Topbar;
