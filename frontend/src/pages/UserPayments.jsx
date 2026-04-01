import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import UserSidebar from "../components/UserSidebar";
import Topbar from "../components/Topbar";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function UserPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payLoadingId, setPayLoadingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const userId = localStorage.getItem("userId");

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      clearMessages();

      if (!userId) {
        setErrorMessage("User session not found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await api.get(`/payments/user/${userId}`);
      setPayments(res.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const paidPayments = useMemo(() => payments.filter((p) => p.status === "paid"), [payments]);
  const pendingPayments = useMemo(() => payments.filter((p) => p.status === "pending"), [payments]);

  const totalPaid = useMemo(
    () => paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [paidPayments]
  );

  const totalPending = useMemo(
    () => pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [pendingPayments]
  );

  const payWithRazorpay = async (payment) => {
    try {
      clearMessages();
      setPayLoadingId(payment._id);

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        setErrorMessage("Failed to load Razorpay SDK. Check your network and try again.");
        return;
      }

      const orderRes = await api.post(`/payments/${payment._id}/razorpay-order`);

      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Hostel Management System",
        description: `Hostel fee payment - ${payment.studentId?.name || "Student"}`,
        order_id: orderRes.data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(`/payments/${payment._id}/razorpay-verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccessMessage(verifyRes.data?.message || "Payment successful");
            fetchPayments();
          } catch (verifyError) {
            setErrorMessage(verifyError.response?.data?.message || "Payment verification failed");
          }
        },
        theme: {
          color: "#1f6feb",
        },
        modal: {
          ondismiss: () => {
            setErrorMessage("Payment was cancelled.");
          },
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to start Razorpay payment");
    } finally {
      setPayLoadingId("");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />

      <Box sx={{ flex: 1, background: "#f3f6fb", minHeight: "100vh" }}>
        <Topbar />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dfe6ef" }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>My Payments</Typography>
            <Typography sx={{ color: "#607084", mt: 0.4 }}>
              Pay your pending dues online using Razorpay.
            </Typography>

            <Grid container spacing={1.2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#edf4ff" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Total Records</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{payments.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#eafaf0" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Paid Amount</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CurrencyRupeeRoundedIcon sx={{ color: "#0b7f41" }} />
                    <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(totalPaid)}</Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#fff3e8" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Pending Amount</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PendingActionsRoundedIcon sx={{ color: "#ad7a00" }} />
                    <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(totalPending)}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

          <Paper sx={{ mt: 2, borderRadius: 3, border: "1px solid #dfe6ef", overflow: "hidden" }}>
            {loading ? (
              <Box sx={{ p: 5, textAlign: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Recorded Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Transaction</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No payment records found.</TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment._id} hover>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            size="small"
                            color={payment.status === "paid" ? "success" : "warning"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {payment.transactionId ? (
                            <Typography sx={{ fontSize: 13 }}>{payment.transactionId}</Typography>
                          ) : (
                            <Typography sx={{ fontSize: 13, color: "#6d7d90" }}>-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.status === "pending" ? (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => payWithRazorpay(payment)}
                              disabled={payLoadingId === payment._id}
                              sx={{ textTransform: "none" }}
                            >
                              {payLoadingId === payment._id ? "Processing..." : "Pay with Razorpay"}
                            </Button>
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <TaskAltRoundedIcon sx={{ color: "#0b7f41", fontSize: 18 }} />
                              <Typography sx={{ fontSize: 13, color: "#0b7f41", fontWeight: 600 }}>Paid</Typography>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Box>
      </Box>
    </div>
  );
}

export default UserPayments;

