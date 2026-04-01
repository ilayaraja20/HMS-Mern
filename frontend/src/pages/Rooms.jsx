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

const initialForm = {
  roomNumber: "",
  capacity: "",
  occupancy: 0,
};

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      clearMessages();

      const res = await api.get("/rooms");
      setRooms(res.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rooms;

    return rooms.filter((room) => {
      return (
        room.roomNumber?.toLowerCase().includes(q) ||
        room.status?.toLowerCase().includes(q)
      );
    });
  }, [rooms, searchText]);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((room) => room.status === "available").length;
  const fullRooms = rooms.filter((room) => room.status === "full").length;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm(initialForm);
    clearMessages();
    setOpen(true);
  };

  const editRoom = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber || "",
      capacity: room.capacity || "",
      occupancy: room.occupancy || 0,
    });
    clearMessages();
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      clearMessages();

      if (!form.roomNumber || !form.capacity) {
        setErrorMessage("Room number and capacity are required");
        return;
      }

      if (Number(form.capacity) <= 0) {
        setErrorMessage("Capacity should be greater than zero");
        return;
      }

      const payload = {
        roomNumber: form.roomNumber,
        capacity: Number(form.capacity),
      };

      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
        setSuccessMessage("Room updated successfully");
      } else {
        await api.post("/rooms", payload);
        setSuccessMessage("Room added successfully");
      }

      setOpen(false);
      setForm(initialForm);
      setEditingId(null);
      fetchRooms();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to save room");
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("Delete this room?")) return;

    try {
      clearMessages();
      await api.delete(`/rooms/${id}`);
      setSuccessMessage("Room deleted successfully");
      fetchRooms();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to delete room");
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
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Room Operations</Typography>
                <Typography sx={{ color: "#607084", mt: 0.4 }}>
                  Track capacity, occupancy, and maintain room availability across the hostel.
                </Typography>
              </Box>

              <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }} onClick={openAddDialog}>
                Add Room
              </Button>
            </Stack>

            <Grid container spacing={1.2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#edf4ff" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Total Rooms</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{totalRooms}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#eafaf0" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Available Rooms</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{availableRooms}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#fff3e8" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Full Rooms</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{fullRooms}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <TextField
              sx={{ mt: 1.5 }}
              fullWidth
              label="Search by room number or status"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
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
                    <TableCell>Room Number</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Occupancy</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No room records found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredRooms.map((room) => (
                      <TableRow key={room._id} hover>
                        <TableCell>{room.roomNumber}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.occupancy}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={room.status}
                            color={room.status === "full" ? "warning" : "success"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" onClick={() => editRoom(room)}>Edit</Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => deleteRoom(room._id)}>Delete</Button>
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
            <DialogTitle>{editingId ? "Edit Room" : "Add Room"}</DialogTitle>
            <DialogContent>
              <TextField margin="dense" label="Room Number" name="roomNumber" fullWidth value={form.roomNumber} onChange={handleChange} />
              <TextField margin="dense" label="Capacity" name="capacity" type="number" fullWidth value={form.capacity} onChange={handleChange} />

              {editingId && (
                <Typography sx={{ mt: 1, color: "#6a7a8f", fontSize: 14 }}>
                  Current occupancy: {form.occupancy}
                </Typography>
              )}
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

export default Rooms;

