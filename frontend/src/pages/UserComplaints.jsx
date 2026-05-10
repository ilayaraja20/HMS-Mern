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
  TextField,
  Typography,
} from "@mui/material";

function UserComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const userId = localStorage.getItem("userId");

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      clearMessages();

      if (!userId) {
        setErrorMessage("User session not found. Please login again.");
        return;
      }

      const res = await api.get(`/complaints/user/${userId}`);
      setComplaints(res.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const pendingCount = useMemo(
    () => complaints.filter((complaint) => complaint.status === "pending").length,
    [complaints]
  );
  const resolvedCount = useMemo(
    () => complaints.filter((complaint) => complaint.status === "resolved").length,
    [complaints]
  );

  const submitComplaint = async () => {
    try {
      clearMessages();

      if (!issue.trim()) {
        setErrorMessage("Please enter a complaint issue.");
        return;
      }

      setSaving(true);
      await api.post("/complaints", { issue: issue.trim() });

      setIssue("");
      setSuccessMessage("Complaint submitted successfully.");
      await fetchComplaints();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />

      <Box sx={{ flex: 1, background: "#f3f6fb", minHeight: "100vh" }}>
        <Topbar />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dfe6ef" }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>My Complaints</Typography>
            <Typography sx={{ color: "#607084", mt: 0.4 }}>
              Raise an issue and track resolution updates from hostel administration.
            </Typography>

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

            <Stack spacing={1.2} sx={{ mt: 1.4 }}>
              <TextField
                label="Describe your issue"
                fullWidth
                multiline
                minRows={3}
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
              />

              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={submitComplaint} disabled={saving}>
                  {saving ? "Submitting..." : "Submit Complaint"}
                </Button>
              </Stack>
            </Stack>
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
                    <TableCell>Issue</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No complaints submitted yet.</TableCell>
                    </TableRow>
                  ) : (
                    complaints.map((complaint) => (
                      <TableRow key={complaint._id} hover>
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

export default UserComplaints;
