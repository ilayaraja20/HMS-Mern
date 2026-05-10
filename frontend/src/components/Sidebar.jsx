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
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import PaymentIcon from "@mui/icons-material/Payment";
import ReportIcon from "@mui/icons-material/Report";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const desktopWidth = 248;
const compactWidth = 86;

function Sidebar() {
  const location = useLocation();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon sx={{ color: "white" }} /> },
    { label: "Students", to: "/students", icon: <PeopleIcon sx={{ color: "white" }} /> },
    { label: "Rooms", to: "/rooms", icon: <HotelIcon sx={{ color: "white" }} /> },
    { label: "Payments", to: "/payments", icon: <PaymentIcon sx={{ color: "white" }} /> },
    { label: "Complaints", to: "/complaints", icon: <ReportIcon sx={{ color: "white" }} /> },
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
          background: "linear-gradient(180deg, #13243b 0%, #0c1a2c 100%)",
          color: "white",
          borderRight: "1px solid #26415d",
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
              background: "linear-gradient(135deg, #0ea5e9 0%, #0f766e 100%)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <ApartmentRoundedIcon />
          </Box>
          {!compact && (
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>HMS Admin</Typography>
              <Typography sx={{ fontSize: 12, color: "#b3c8df" }}>Operations Console</Typography>
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
                    background: "linear-gradient(90deg, rgba(59,130,246,0.33), rgba(14,165,233,0.2))",
                    border: "1px solid rgba(125, 192, 255, 0.5)",
                  },
                  "&.Mui-selected:hover": {
                    background: "linear-gradient(90deg, rgba(59,130,246,0.4), rgba(14,165,233,0.24))",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!compact && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {!compact && (
        <Box sx={{ p: 1.2, borderRadius: 2, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(179,200,223,0.2)" }}>
          <Typography sx={{ fontSize: 12, color: "#c6d8ea" }}>
            Track hostel operations with secure role-based controls.
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

export default Sidebar;
