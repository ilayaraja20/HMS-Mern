import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import PaymentIcon from "@mui/icons-material/Payment";
import ReportIcon from "@mui/icons-material/Report";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const drawerWidth = 220;

function Sidebar() {
  const location = useLocation();

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
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          backgroundColor: "#152233",
          color: "white",
          borderRight: "1px solid #26374f",
        }
      }}
    >
      <div style={{ padding: "20px 20px 10px 20px" }}>
        <h3 style={{ margin: 0 }}>HMS Admin</h3>
        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#c6d3e1" }}>
          Operations Console
        </p>
      </div>

      <List>
        {navItems.map((item) => (
          <ListItem disablePadding key={item.to}>
            <ListItemButton
              component={Link}
              to={item.to}
              selected={location.pathname === item.to}
              sx={{
                "&.Mui-selected": {
                  background: "rgba(255,255,255,0.14)",
                  borderRight: "3px solid #7dc0ff",
                },
                "&.Mui-selected:hover": {
                  background: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

      </List>
    </Drawer>
  );
}

export default Sidebar;
