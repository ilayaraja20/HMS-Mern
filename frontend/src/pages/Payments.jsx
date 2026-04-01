import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const initialForm = {
  studentId: "",
  amount: "",
  status: "pending",
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      clearMessages();

      const [paymentRes, studentRes] = await Promise.all([
        api.get("/payments"),
        api.get("/students"),
      ]);

      setPayments(paymentRes.data || []);
      setStudents(studentRes.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to fetch payments data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPayments = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return payments.filter((payment) => {
      const studentName = payment.studentId?.name?.toLowerCase() || "";
      const textMatch = !q || studentName.includes(q);
      const statusMatch = statusFilter === "all" || payment.status === statusFilter;
      return textMatch && statusMatch;
    });
  }, [payments, searchText, statusFilter]);

  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const pendingPayments = payments.filter((payment) => payment.status === "pending");

  const collectedAmount = paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pendingAmount = pendingPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      clearMessages();

      if (!form.studentId || !form.amount) {
        setErrorMessage("Please select student and enter amount");
        return;
      }

      if (Number(form.amount) <= 0) {
        setErrorMessage("Amount should be greater than zero");
        return;
      }

      await api.post("/payments", {
        ...form,
        amount: Number(form.amount),
      });

      setOpen(false);
      setForm(initialForm);
      setSuccessMessage("Payment recorded successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to save payment");
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      clearMessages();
      await api.put(`/payments/${id}`, { status });
      setSuccessMessage(`Payment status updated to ${status}`);
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update payment status");
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;

    try {
      clearMessages();
      await api.delete(`/payments/${id}`);
      setSuccessMessage("Payment deleted successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to delete payment");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <Box sx={{ flex: 1, background: "#f3f6fb", minHeight: "100vh" }}>
        <Topbar />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dfe6ef" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Payment Operations</Typography>
                <Typography sx={{ color: "#607084", mt: 0.4 }}>
                  Track fee collection, follow pending dues, and maintain clean payment records.
                </Typography>
              </Box>

              <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }} onClick={() => setOpen(true)}>
                Record Payment
              </Button>
            </Stack>

            <Grid container spacing={1.2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#edf4ff" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Total Records</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{payments.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#eafaf0" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Collected</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{formatCurrency(collectedAmount)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#fff3e8" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Pending Amount</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{formatCurrency(pendingAmount)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#f0f4ff" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Pending Records</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{pendingPayments.length}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={1.4} sx={{ mt: 0.2 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Search by student name"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    label="Status Filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
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
                    <TableCell>Student</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No payment records found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment._id} hover>
                        <TableCell>{payment.studentId?.name || "Unknown Student"}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={payment.status}
                            color={payment.status === "paid" ? "success" : "warning"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {payment.status === "pending" ? (
                              <Button size="small" variant="outlined" onClick={() => updatePaymentStatus(payment._id, "paid")}>
                                Mark Paid
                              </Button>
                            ) : (
                              <Button size="small" variant="outlined" onClick={() => updatePaymentStatus(payment._id, "pending")}>
                                Mark Pending
                              </Button>
                            )}
                            <Button size="small" color="error" variant="outlined" onClick={() => deletePayment(payment._id)}>
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>

          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Record Payment</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Student</InputLabel>
                <Select name="studentId" label="Student" value={form.studentId} onChange={handleChange}>
                  {students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>{student.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                label="Amount"
                name="amount"
                type="number"
                fullWidth
                value={form.amount}
                onChange={handleChange}
              />

              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select name="status" label="Status" value={form.status} onChange={handleChange}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit}>Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </div>
  );
}

export default Payments;

