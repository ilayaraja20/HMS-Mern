import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaymentIcon from "@mui/icons-material/Payment";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthStore";

const desktopWidth = 248;
const compactWidth = 86;

function UserSidebar() {
  const location = useLocation();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/user-login");
  };

  const navItems = [
    { label: "Dashboard", to: "/user-dashboard", icon: <DashboardIcon sx={{ color: "white" }} /> },
    { label: "Payments", to: "/user-payments", icon: <PaymentIcon sx={{ color: "white" }} /> },
    { label: "Complaints", to: "/user-complaints", icon: <ReportProblemRoundedIcon sx={{ color: "white" }} /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: compact ? compactWidth : desktopWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: compact ? compactWidth : desktopWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #173251 0%, #122740 100%)",
          color: "white",
          borderRight: "1px solid #2f4f72",
          p: compact ? 1.2 : 1.6,
          justifyContent: "space-between",
        },
      }}
    >
      <Box>
        <Box sx={{ px: compact ? 0.5 : 1, py: 1.1, display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: compact ? 40 : 42,
              height: compact ? 40 : 42,
              borderRadius: 2.4,
              background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <ApartmentRoundedIcon />
          </Box>
          {!compact && (
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Student Panel</Typography>
              <Typography sx={{ fontSize: 12, color: "#c9dbef" }}>Portal Access</Typography>
            </Box>
          )}
        </Box>

        <List sx={{ mt: 1 }}>
          {navItems.map((item) => (
            <ListItem disablePadding key={item.to} sx={{ mb: 0.6 }}>
              <ListItemButton
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{
                  minHeight: 46,
                  borderRadius: 2,
                  px: compact ? 1.2 : 1.4,
                  justifyContent: compact ? "center" : "flex-start",
                  "& .MuiListItemIcon-root": {
                    minWidth: compact ? "auto" : 34,
                    justifyContent: "center",
                  },
                  "&.Mui-selected": {
                    background: "linear-gradient(90deg, rgba(96,165,250,0.36), rgba(59,130,246,0.24))",
                    border: "1px solid rgba(147,197,253,0.5)",
                  },
                  "&.Mui-selected:hover": {
                    background: "linear-gradient(90deg, rgba(96,165,250,0.44), rgba(59,130,246,0.3))",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!compact && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding sx={{ mt: 0.8 }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 46,
                borderRadius: 2,
                px: compact ? 1.2 : 1.4,
                justifyContent: compact ? "center" : "flex-start",
                "& .MuiListItemIcon-root": {
                  minWidth: compact ? "auto" : 34,
                  justifyContent: "center",
                },
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: "white" }} />
              </ListItemIcon>
              {!compact && <ListItemText primary="Logout" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {!compact && (
        <Box sx={{ p: 1.2, borderRadius: 2, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(201,219,239,0.24)" }}>
          <Typography sx={{ fontSize: 12, color: "#c9dbef" }}>
            Review dues, complete payments, and track room details in one workspace.
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

export default UserSidebar;
