import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import BedRoundedIcon from "@mui/icons-material/BedRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-IN")}`;
};

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [statsRes, paymentRes, complaintRes, roomRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/payments"),
        api.get("/complaints"),
        api.get("/rooms"),
      ]);

      setStats(statsRes.data || {});
      setPayments(paymentRes.data || []);
      setComplaints(complaintRes.data || []);
      setRooms(roomRes.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const resolveComplaint = async (complaintId) => {
    try {
      await api.put(`/complaints/${complaintId}`, { status: "resolved" });
      setSuccessMessage("Complaint marked as resolved");
      fetchDashboardData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to update complaint");
    }
  };

  const markPaymentPaid = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}`, { status: "paid" });
      setSuccessMessage("Payment marked as paid");
      fetchDashboardData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to update payment");
    }
  };

  const occupancyRate = useMemo(() => {
    const total = Number(stats.totalRooms || 0);
    const occupied = Number(stats.occupiedRooms || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((occupied / total) * 100));
  }, [stats]);

  const complaintSummary = useMemo(() => {
    const pending = complaints.filter((c) => c.status === "pending").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    return { pending, resolved };
  }, [complaints]);

  const paymentSummary = useMemo(() => {
    const pending = payments.filter((p) => p.status === "pending").length;
    const paid = payments.filter((p) => p.status === "paid").length;
    return { pending, paid };
  }, [payments]);

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0))
      .slice(0, 5);
  }, [payments]);

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [complaints]);

  const roomCapacityMeta = useMemo(() => {
    const full = rooms.filter((r) => r.status === "full").length;
    const available = rooms.filter((r) => r.status !== "full").length;
    return { full, available };
  }, [rooms]);

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents || 0,
      icon: <PeopleAltRoundedIcon />,
      tone: "#1f6feb",
    },
    {
      label: "Total Rooms",
      value: stats.totalRooms || 0,
      icon: <HomeWorkRoundedIcon />,
      tone: "#00866b",
    },
    {
      label: "Occupied Rooms",
      value: stats.occupiedRooms || 0,
      icon: <BedRoundedIcon />,
      tone: "#9c6b00",
    },
    {
      label: "Fees Collected",
      value: formatCurrency(stats.feesCollected || 0),
      icon: <CurrencyRupeeRoundedIcon />,
      tone: "#5c45a5",
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <Box sx={{ flex: 1, minHeight: "100vh", background: "linear-gradient(180deg, #eef3f8 0%, #f7f9fb 100%)" }}>
        <Topbar />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: "1px solid #dde6f0",
              background: "linear-gradient(120deg, #ffffff 0%, #f8fbff 100%)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Admin Operations Dashboard
                </Typography>
                <Typography sx={{ mt: 0.5, color: "#5e6d7e" }}>
                  Monitor hostel operations, take quick actions, and track key performance indicators.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`Pending Complaints: ${complaintSummary.pending}`} color="warning" variant="outlined" />
                <Button
                  startIcon={<RefreshRoundedIcon />}
                  onClick={fetchDashboardData}
                  variant="contained"
                  sx={{ textTransform: "none", borderRadius: 2, background: "#1f6feb" }}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}

          {loading ? (
            <Paper sx={{ mt: 2, p: 6, borderRadius: 3, textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 1.5, color: "#5e6d7e" }}>Loading dashboard metrics...</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.2} sx={{ mt: 0.6 }} alignItems="stretch">
              {statCards.map((card) => (
                <Grid item xs={12} sm={6} lg={3} key={card.label} sx={{ display: "flex" }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      border: "1px solid #e3e9f1",
                      width: "100%",
                      minHeight: 126,
                      display: "flex",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, color: "#66758a", fontWeight: 600 }}>{card.label}</Typography>
                        <Typography sx={{ mt: 0.4, fontSize: { xs: 24, md: 29 }, fontWeight: 800, lineHeight: 1.2 }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Avatar sx={{ background: `${card.tone}1a`, color: card.tone }}>{card.icon}</Avatar>
                    </Stack>
                  </Paper>
                </Grid>
              ))}

              <Grid item xs={12} lg={7} sx={{ display: "flex" }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid #e3e9f1",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 428,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Operational Insights</Typography>
                  <Typography sx={{ color: "#5e6d7e", fontSize: 14, mb: 2 }}>
                    Current occupancy and service-status indicators.
                  </Typography>

                  <Box sx={{ mb: 2.2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}>
                      <Typography sx={{ fontWeight: 600 }}>Room Occupancy</Typography>
                      <Typography sx={{ color: "#2d3f53", fontWeight: 700 }}>{occupancyRate}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={occupancyRate} sx={{ height: 10, borderRadius: 99 }} />
                    <Typography sx={{ mt: 0.7, color: "#6d7d90", fontSize: 13 }}>
                      Available Rooms: {roomCapacityMeta.available} | Full Rooms: {roomCapacityMeta.full}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.2}>
                    <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                      <Paper sx={{ p: 1.6, borderRadius: 2.5, background: "#fff7e7", border: "1px solid #f2dfab", width: "100%" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PendingActionsRoundedIcon sx={{ color: "#ad7a00" }} />
                          <Typography sx={{ fontWeight: 700 }}>Pending Complaints</Typography>
                        </Stack>
                        <Typography sx={{ mt: 0.8, fontSize: 24, fontWeight: 800 }}>{complaintSummary.pending}</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                      <Paper sx={{ p: 1.6, borderRadius: 2.5, background: "#ebfaf0", border: "1px solid #bfe8cd", width: "100%" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TaskAltRoundedIcon sx={{ color: "#0b7f41" }} />
                          <Typography sx={{ fontWeight: 700 }}>Resolved Complaints</Typography>
                        </Stack>
                        <Typography sx={{ mt: 0.8, fontSize: 24, fontWeight: 800 }}>{complaintSummary.resolved}</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                      <Paper sx={{ p: 1.6, borderRadius: 2.5, background: "#eef5ff", border: "1px solid #c8dcff", width: "100%" }}>
                        <Typography sx={{ fontWeight: 700 }}>Paid Payments</Typography>
                        <Typography sx={{ mt: 0.8, fontSize: 24, fontWeight: 800 }}>{paymentSummary.paid}</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                      <Paper sx={{ p: 1.6, borderRadius: 2.5, background: "#fff1f0", border: "1px solid #f5c4c0", width: "100%" }}>
                        <Typography sx={{ fontWeight: 700 }}>Pending Payments</Typography>
                        <Typography sx={{ mt: 0.8, fontSize: 24, fontWeight: 800 }}>{paymentSummary.pending}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5} sx={{ display: "flex" }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid #e3e9f1",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 428,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Quick Actions</Typography>
                  <Typography sx={{ color: "#5e6d7e", fontSize: 14, mb: 2 }}>
                    Navigate directly to operational modules.
                  </Typography>

                  <Stack spacing={1.2}>
                    <Button
                      variant="outlined"
                      sx={{ justifyContent: "space-between", textTransform: "none", borderRadius: 2, width: "100%" }}
                      onClick={() => navigate("/students")}
                      endIcon={<ArrowForwardRoundedIcon />}
                    >
                      Manage Students
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{ justifyContent: "space-between", textTransform: "none", borderRadius: 2, width: "100%" }}
                      onClick={() => navigate("/rooms")}
                      endIcon={<ArrowForwardRoundedIcon />}
                    >
                      Manage Rooms
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{ justifyContent: "space-between", textTransform: "none", borderRadius: 2, width: "100%" }}
                      onClick={() => navigate("/payments")}
                      endIcon={<ArrowForwardRoundedIcon />}
                    >
                      Record Payments
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{ justifyContent: "space-between", textTransform: "none", borderRadius: 2, width: "100%" }}
                      onClick={() => navigate("/complaints")}
                      endIcon={<ArrowForwardRoundedIcon />}
                    >
                      Resolve Complaints
                    </Button>
                  </Stack>

                  <Paper sx={{ mt: "auto", p: 1.5, borderRadius: 2.5, background: "#f7fafd", border: "1px dashed #c7d6ea" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReportProblemRoundedIcon sx={{ color: "#7e5a00" }} />
                      <Typography sx={{ fontWeight: 700 }}>Action Priority</Typography>
                    </Stack>
                    <Typography sx={{ mt: 0.5, color: "#5e6d7e", fontSize: 13 }}>
                      Focus first on pending complaints and pending payments to keep hostel operations smooth.
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                <Paper
                  sx={{
                    p: 2.2,
                    borderRadius: 3,
                    border: "1px solid #e3e9f1",
                    height: "100%",
                    width: "100%",
                    minHeight: 390,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Complaints</Typography>
                  <Typography sx={{ color: "#5e6d7e", fontSize: 13.5, mb: 1.4 }}>
                    Most recent complaint records requiring attention.
                  </Typography>

                  {recentComplaints.length === 0 ? (
                    <Typography sx={{ color: "#6b7c91" }}>No complaints available.</Typography>
                  ) : (
                    <Stack spacing={1.1}>
                      {recentComplaints.map((item) => (
                        <Paper key={item._id} sx={{ p: 1.2, border: "1px solid #edf1f6", borderRadius: 2.2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
                                {item.studentId?.name || "Unknown Student"}
                              </Typography>
                              <Typography sx={{ color: "#64778c", fontSize: 13 }} noWrap>
                                {item.issue}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0, minWidth: 150, justifyContent: "flex-end" }}>
                              <Chip
                                label={item.status}
                                size="small"
                                color={item.status === "resolved" ? "success" : "warning"}
                                variant="outlined"
                              />
                              {item.status === "pending" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => resolveComplaint(item._id)}
                                  sx={{ textTransform: "none" }}
                                >
                                  Resolve
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                <Paper
                  sx={{
                    p: 2.2,
                    borderRadius: 3,
                    border: "1px solid #e3e9f1",
                    height: "100%",
                    width: "100%",
                    minHeight: 390,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Payments</Typography>
                  <Typography sx={{ color: "#5e6d7e", fontSize: 13.5, mb: 1.4 }}>
                    Latest payment entries and collection progress.
                  </Typography>

                  {recentPayments.length === 0 ? (
                    <Typography sx={{ color: "#6b7c91" }}>No payments recorded yet.</Typography>
                  ) : (
                    <Stack spacing={1.1}>
                      {recentPayments.map((item) => (
                        <Paper key={item._id} sx={{ p: 1.2, border: "1px solid #edf1f6", borderRadius: 2.2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                {item.studentId?.name || "Unknown Student"}
                              </Typography>
                              <Typography sx={{ color: "#64778c", fontSize: 13 }} noWrap>
                                {new Date(item.paymentDate).toLocaleDateString()} | {formatCurrency(item.amount)}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0, minWidth: 150, justifyContent: "flex-end" }}>
                              <Chip
                                label={item.status}
                                size="small"
                                color={item.status === "paid" ? "success" : "warning"}
                                variant="outlined"
                              />
                              {item.status === "pending" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => markPaymentPaid(item._id)}
                                  sx={{ textTransform: "none" }}
                                >
                                  Mark Paid
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default Dashboard;

