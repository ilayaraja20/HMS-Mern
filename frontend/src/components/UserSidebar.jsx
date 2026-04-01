import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



function UserSidebar() {

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
    navigate("/user-login");
  };
const drawerWidth = 220;
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          backgroundColor: "#1e293b",
          color: "white"
        }
      }}
    >

      <h3 style={{ padding: "20px" }}>Student Panel</h3>

      <List>

        <ListItem button component={Link} to="/user-dashboard">
          <ListItemIcon><DashboardIcon style={{ color: "white" }} /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button component={Link} to="/user-payments">
          <ListItemIcon><PaymentIcon style={{ color: "white" }} /></ListItemIcon>
          <ListItemText primary="Payments" />
        </ListItem>

        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon style={{ color: "white" }} /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>

      </List>

    </Drawer>
  );
}

export default UserSidebar;
