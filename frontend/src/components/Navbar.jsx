import React from "react";
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

function Navbar() {

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goAdmin = () => {
    navigate("/admin-login");
    handleClose();
  };

  const goUser = () => {
    navigate("/user-login");
    handleClose();
  };

  return (
    <AppBar position="sticky" sx={{ background: "#0f172a" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        {/* Left side hostel name */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          HostelHub
        </Typography>

        {/* Right side login button */}
        <div>
          <Button
            color="inherit"
            startIcon={<AccountCircleIcon />}
            onClick={handleClick}
            sx={{ textTransform: "none", fontSize: "16px" }}
          >
            Login & Register
          </Button>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={goAdmin}>
              Admin
            </MenuItem>

            <MenuItem onClick={goUser}>
              User
            </MenuItem>

          </Menu>
        </div>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;