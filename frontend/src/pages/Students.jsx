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
  name: "",
  department: "",
  year: "",
  roomNumber: "",
  contact: "",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

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

      const [studentRes, roomRes] = await Promise.all([
        api.get("/students"),
        api.get("/rooms"),
      ]);

      setStudents(studentRes.data || []);
      setRooms(roomRes.data || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to fetch students data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const departmentOptions = useMemo(() => {
    const values = new Set((students || []).map((s) => s.department).filter(Boolean));
    return ["all", ...Array.from(values)];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return (students || []).filter((student) => {
      const search = searchText.trim().toLowerCase();
      const textMatch =
        !search ||
        student.name?.toLowerCase().includes(search) ||
        student.contact?.toLowerCase().includes(search) ||
        student.roomNumber?.toLowerCase().includes(search);

      const departmentMatch = departmentFilter === "all" || student.department === departmentFilter;

      return textMatch && departmentMatch;
    });
  }, [students, searchText, departmentFilter]);

  const totalStudents = students.length;
  const allocatedStudents = students.filter((s) => s.roomNumber).length;
  const unallocatedStudents = totalStudents - allocatedStudents;

  const availableRooms = rooms.filter((room) => room.status === "available");
  const assignableRooms = useMemo(() => {
    return rooms.filter((room) => room.status === "available" || room.roomNumber === form.roomNumber);
  }, [rooms, form.roomNumber]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(initialForm);
    clearMessages();
    setOpen(true);
  };

  const openEditDialog = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name || "",
      department: student.department || "",
      year: student.year || "",
      roomNumber: student.roomNumber || "",
      contact: student.contact || "",
    });
    clearMessages();
    setOpen(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      clearMessages();

      if (!form.name || !form.department || !form.year || !form.contact) {
        setErrorMessage("Please fill all required fields");
        return;
      }

      if (editingId) {
        await api.put(`/students/${editingId}`, form);
        setSuccessMessage("Student updated successfully");
      } else {
        await api.post("/students", form);
        setSuccessMessage("Student added successfully");
      }

      setOpen(false);
      setForm(initialForm);
      setEditingId(null);
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to save student");
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student record?")) return;

    try {
      clearMessages();
      await api.delete(`/students/${id}`);
      setSuccessMessage("Student deleted successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to delete student");
    }
  };

  const allocateRoom = async (studentId, roomNumber) => {
    if (!roomNumber) return;

    try {
      clearMessages();
      const res = await api.put(`/students/allocate/${studentId}`, { roomNumber });
      setSuccessMessage(res.data?.message || "Room allocated successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to allocate room");
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
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Student Operations</Typography>
                <Typography sx={{ color: "#607084", mt: 0.4 }}>
                  Manage student profiles, room assignments, and hostel allocation status.
                </Typography>
              </Box>

              <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }} onClick={openAddDialog}>
                Add Student
              </Button>
            </Stack>

            <Grid container spacing={1.2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#edf4ff" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Total Students</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{totalStudents}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#eafaf0" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Allocated Rooms</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{allocatedStudents}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 1.4, borderRadius: 2.5, background: "#fff3e8" }}>
                  <Typography sx={{ color: "#5e6e80", fontSize: 13 }}>Unallocated Students</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{unallocatedStudents}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={1.4} sx={{ mt: 0.2 }}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Search by name, contact or room"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Department</InputLabel>
                  <Select
                    label="Filter by Department"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    {departmentOptions.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </MenuItem>
                    ))}
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
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Allocate Room</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No student records found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>
                          {student.roomNumber ? <Chip size="small" label={student.roomNumber} color="success" variant="outlined" /> : <Chip size="small" label="Unassigned" color="warning" variant="outlined" />}
                        </TableCell>
                        <TableCell>{student.contact}</TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <Select
                              displayEmpty
                              value=""
                              onChange={(e) => allocateRoom(student._id, e.target.value)}
                            >
                              <MenuItem value="">Select Room</MenuItem>
                              {availableRooms
                                .filter((room) => room.roomNumber !== student.roomNumber)
                                .map((room) => (
                                  <MenuItem key={room._id} value={room.roomNumber}>
                                    {room.roomNumber} ({room.occupancy}/{room.capacity})
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" onClick={() => openEditDialog(student)}>Edit</Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => deleteStudent(student._id)}>Delete</Button>
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
            <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
            <DialogContent>
              <TextField margin="dense" label="Name" name="name" fullWidth value={form.name} onChange={handleChange} />
              <TextField margin="dense" label="Department" name="department" fullWidth value={form.department} onChange={handleChange} />
              <TextField margin="dense" label="Year" name="year" fullWidth value={form.year} onChange={handleChange} />

              <FormControl fullWidth sx={{ mt: 1.2 }}>
                <InputLabel>Room (Optional)</InputLabel>
                <Select name="roomNumber" value={form.roomNumber || ""} label="Room (Optional)" onChange={handleChange}>
                  <MenuItem value="">No Room</MenuItem>
                  {assignableRooms.map((room) => (
                    <MenuItem key={room._id} value={room.roomNumber}>
                      {room.roomNumber} ({room.occupancy}/{room.capacity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField margin="dense" label="Contact" name="contact" fullWidth value={form.contact} onChange={handleChange} />
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

export default Students;

