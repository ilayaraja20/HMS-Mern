import { useCallback, useEffect, useMemo, useState } from "react";
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
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");
const formatDateTime = (value) => (value ? new Date(value).toLocaleString("en-IN") : "-");

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

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

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
  }, [userId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
    const stopPayLoading = () => setPayLoadingId("");

    try {
      clearMessages();
      setPayLoadingId(payment._id);

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        setErrorMessage("Failed to load Razorpay SDK. Check your network and try again.");
        stopPayLoading();
        return;
      }

      const orderRes = await api.post(`/payments/${payment._id}/razorpay-order`);
      let paymentCompleted = false;

      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Hostel Management System",
        description: `Hostel fee payment - ${payment.studentId?.name || "Student"}`,
        order_id: orderRes.data.orderId,
        prefill: {
          name: payment.studentId?.name || "Student",
          contact: payment.studentId?.contact || "",
        },
        handler: async function (response) {
          try {
            const verifyRes = await api.post(`/payments/${payment._id}/razorpay-verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            paymentCompleted = true;
            setSuccessMessage(verifyRes.data?.message || "Payment successful");
            await fetchPayments();
          } catch (verifyError) {
            setErrorMessage(verifyError.response?.data?.message || "Payment verification failed");
          } finally {
            stopPayLoading();
          }
        },
        theme: {
          color: "#1f6feb",
        },
        modal: {
          ondismiss: () => {
            if (!paymentCompleted) {
              setErrorMessage("Payment was cancelled.");
            }
            stopPayLoading();
          },
        },
      };

      const rz = new window.Razorpay(options);
      rz.on("payment.failed", (response) => {
        const reason = response?.error?.description || "Payment failed. Please try again.";
        setErrorMessage(reason);
        stopPayLoading();
      });
      rz.open();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to start Razorpay payment");
      stopPayLoading();
    }
  };

  const downloadReceipt = (payment) => {
    const receiptNumber = `HMS-${String(payment._id || "").slice(-8).toUpperCase()}`;
    const receiptDate = formatDateTime(payment.paidAt || payment.paymentDate);
    const studentName = payment.studentId?.name || "Student";
    const transactionId = payment.transactionId || "-";
    const paymentMethod = payment.paymentMethod || "razorpay";
    const amount = formatCurrency(payment.amount);

    const receiptHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt - ${receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f7fb; }
    .card { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #d8e0eb; border-radius: 10px; overflow: hidden; }
    .head { background: #1f6feb; color: #fff; padding: 18px 22px; }
    .head h1 { margin: 0; font-size: 20px; }
    .head p { margin: 4px 0 0; font-size: 13px; opacity: 0.95; }
    .body { padding: 20px 22px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px solid #eef2f7; padding: 10px 0; gap: 10px; }
    .row:last-child { border-bottom: none; }
    .label { color: #5f6f82; font-size: 14px; }
    .value { color: #1f2d3d; font-size: 14px; font-weight: 700; text-align: right; }
    .amount { font-size: 22px; color: #0b7f41; }
    .foot { padding: 14px 22px 20px; color: #5f6f82; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <h1>Hostel Management System</h1>
      <p>Online Payment Receipt</p>
    </div>
    <div class="body">
      <div class="row"><div class="label">Receipt Number</div><div class="value">${receiptNumber}</div></div>
      <div class="row"><div class="label">Student Name</div><div class="value">${studentName}</div></div>
      <div class="row"><div class="label">Recorded Date</div><div class="value">${formatDate(payment.paymentDate)}</div></div>
      <div class="row"><div class="label">Paid Date</div><div class="value">${receiptDate}</div></div>
      <div class="row"><div class="label">Payment Method</div><div class="value">${paymentMethod}</div></div>
      <div class="row"><div class="label">Transaction ID</div><div class="value">${transactionId}</div></div>
      <div class="row"><div class="label">Amount Paid</div><div class="value amount">${amount}</div></div>
    </div>
    <div class="foot">
      This is a system-generated receipt for your hostel payment.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                            <Stack direction="row" spacing={1} alignItems="center">
                              <TaskAltRoundedIcon sx={{ color: "#0b7f41", fontSize: 18 }} />
                              <Typography sx={{ fontSize: 13, color: "#0b7f41", fontWeight: 600 }}>Paid</Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadRoundedIcon />}
                                onClick={() => downloadReceipt(payment)}
                                sx={{ textTransform: "none" }}
                              >
                                Download Receipt
                              </Button>
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

