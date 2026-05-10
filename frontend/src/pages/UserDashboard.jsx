import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

import UserSidebar from "../components/UserSidebar";
import Topbar from "../components/Topbar";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

function UserDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!userId) {
        setErrorMessage("User session not found. Please login again.");
        setLoading(false);
        return;
      }

      const studentRes = await api.get(`/users/${userId}`);
      setStudent(studentRes.data || null);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />

      <Box sx={{ flex: 1, minHeight: "100vh", background: "linear-gradient(180deg, #eef3f8 0%, #f7f9fb 100%)" }}>
        <Topbar />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #dde6f0" }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Student Dashboard</Typography>
                <Typography sx={{ mt: 0.5, color: "#5e6d7e" }}>
                  Profile and room information are available here.
                </Typography>
              </Box>

              <Button
                startIcon={<RefreshRoundedIcon />}
                onClick={fetchData}
                variant="contained"
                sx={{ textTransform: "none", borderRadius: 2, background: "#1f6feb" }}
              >
                Refresh
              </Button>
            </Stack>
          </Paper>

          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}

          {loading ? (
            <Paper sx={{ mt: 2, p: 6, borderRadius: 3, textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 1.5, color: "#5e6d7e" }}>Loading student dashboard...</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.2} sx={{ mt: 0.6 }} alignItems="stretch">
              <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                <Paper sx={{ p: 2.2, borderRadius: 3, border: "1px solid #e3e9f1", width: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#66758a", fontWeight: 600 }}>Student Name</Typography>
                      <Typography sx={{ mt: 0.4, fontSize: 22, fontWeight: 800 }}>{student?.name || "Student"}</Typography>
                    </Box>
                    <AccountCircleRoundedIcon sx={{ color: "#1f6feb", fontSize: 32 }} />
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                <Paper sx={{ p: 2.2, borderRadius: 3, border: "1px solid #e3e9f1", width: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#66758a", fontWeight: 600 }}>Allocated Room</Typography>
                      <Typography sx={{ mt: 0.4, fontSize: 22, fontWeight: 800 }}>{student?.roomNumber || "Not Allocated"}</Typography>
                    </Box>
                    <MeetingRoomRoundedIcon sx={{ color: "#0b7f41", fontSize: 32 }} />
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                <Paper sx={{ p: 2.2, borderRadius: 3, border: "1px solid #e3e9f1", width: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: 13, color: "#66758a", fontWeight: 600 }}>Account Status</Typography>
                      <Typography sx={{ mt: 0.4, fontSize: 22, fontWeight: 800 }}>Active</Typography>
                    </Box>
                    <VerifiedUserRoundedIcon sx={{ color: "#7b61ff", fontSize: 32 }} />
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2.4, borderRadius: 3, border: "1px solid #e3e9f1" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Profile Details</Typography>
                  <Typography sx={{ color: "#5e6d7e", fontSize: 14, mb: 1.4 }}>
                    Use the Payments tab in the sidebar to complete your pending dues through Razorpay.
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={4}>
                      <Typography sx={{ color: "#6b7c91", fontSize: 13 }}>Email</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{student?.email || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography sx={{ color: "#6b7c91", fontSize: 13 }}>Phone</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{student?.phone || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography sx={{ color: "#6b7c91", fontSize: 13 }}>Department / Year</Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {student?.department || "-"} {student?.year ? `/ ${student.year}` : ""}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default UserDashboard;

