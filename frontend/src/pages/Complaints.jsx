import { useCallback, useEffect, useMemo, useState } from "react";
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
  issue: "",
};

function Complaints() {
  const [complaints, setComplaints] = useState([]);
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const [complaintRes, studentRes] = await Promise.all([
        api.get("/complaints"),
        api.get("/students"),
      ]);

      setComplaints(complaintRes.data || []);
      setStudents(studentRes.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to fetch complaints data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredComplaints = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return complaints.filter((complaint) => {
      const studentName = complaint.studentId?.name?.toLowerCase() || "";
      const issue = complaint.issue?.toLowerCase() || "";
      const textMatch = !q || studentName.includes(q) || issue.includes(q);
      const statusMatch = statusFilter === "all" || complaint.status === statusFilter;
      return textMatch && statusMatch;
    });
  }, [complaints, searchText, statusFilter]);

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      clearMessages();

      if (!form.studentId || !form.issue.trim()) {
        setErrorMessage("Please choose student and enter issue");
        return;
      }

      await api.post("/complaints", form);

      setOpen(false);
      setForm(initialForm);
      setSuccessMessage("Complaint added successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to create complaint");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      clearMessages();
      await api.put(`/complaints/${id}`, { status });
      setSuccessMessage(`Complaint marked as ${status}`);
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update complaint");
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;

    try {
      clearMessages();
      await api.delete(`/complaints/${id}`);
      setSuccessMessage("Complaint deleted successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to delete complaint");
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
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Complaint Operations</Typography>
                <Typography sx={{ color: "#607084", mt: 0.4 }}>
                  Track student issues, prioritize pending items, and close complaints quickly.
                </Typography>
              </Box>

              <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }} onClick={() => setOpen(true)}>
                Add Complaint
              </Button>
            </Stack>

            <Grid container spacing={1.2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#edf4ff" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Total Complaints</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{complaints.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#fff3e8" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Pending</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{pendingCount}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#eafaf0" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Resolved</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{resolvedCount}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={1.4} sx={{ mt: 0.2 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Search by student name or issue"
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
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
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
                    <TableCell>Issue</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No complaint records found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint._id} hover>
                        <TableCell>{complaint.studentId?.name || "Unknown Student"}</TableCell>
                        <TableCell>{complaint.issue}</TableCell>
                        <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={complaint.status}
                            color={complaint.status === "resolved" ? "success" : "warning"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {complaint.status === "pending" ? (
                              <Button size="small" variant="outlined" onClick={() => updateStatus(complaint._id, "resolved")}>Resolve</Button>
                            ) : (
                              <Button size="small" variant="outlined" onClick={() => updateStatus(complaint._id, "pending")}>Reopen</Button>
                            )}
                            <Button size="small" color="error" variant="outlined" onClick={() => deleteComplaint(complaint._id)}>Delete</Button>
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
            <DialogTitle>Add Complaint</DialogTitle>
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
                label="Issue"
                name="issue"
                fullWidth
                multiline
                minRows={3}
                value={form.issue}
                onChange={handleChange}
              />
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

export default Complaints;

