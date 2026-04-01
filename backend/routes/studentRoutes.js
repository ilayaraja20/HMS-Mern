const express = require("express");

const router = express.Router();
const Student = require("../models/Student");
const Room = require("../models/Room");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const normalizeRoomNumber = (value) => {
  if (!value) return null;
  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase().includes("select room")) return null;
  return normalized;
};

const updateRoomStatus = async (room) => {
  if (!room) return;
  room.status = Number(room.occupancy) >= Number(room.capacity) ? "full" : "available";
  await room.save();
};

const releaseRoom = async (roomNumber) => {
  if (!roomNumber) return;
  const room = await Room.findOne({ roomNumber });
  if (!room) return;

  room.occupancy = Math.max(0, Number(room.occupancy) - 1);
  await updateRoomStatus(room);
};

const reserveRoom = async (roomNumber) => {
  if (!roomNumber) return;

  const room = await Room.findOne({ roomNumber });

  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  if (Number(room.occupancy) >= Number(room.capacity)) {
    const error = new Error("Room is full");
    error.statusCode = 400;
    throw error;
  }

  room.occupancy += 1;
  await updateRoomStatus(room);
};

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const roomNumber = normalizeRoomNumber(req.body.roomNumber);

    const student = new Student({
      ...req.body,
      roomNumber,
    });

    await student.save();

    if (roomNumber) {
      try {
        await reserveRoom(roomNumber);
      } catch (error) {
        await Student.findByIdAndDelete(student._id);
        return res.status(error.statusCode || 500).json({ message: error.message || "Failed to assign room" });
      }
    }

    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create student" });
  }
});

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch students" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const isSameUser = req.user.role === "user" && req.user.id === req.params.id;
    const isAdmin = req.user.role === "admin";

    if (!isSameUser && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch student" });
  }
});

router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const previousRoom = normalizeRoomNumber(student.roomNumber);
    const nextRoom = normalizeRoomNumber(req.body.roomNumber);

    if (nextRoom !== previousRoom) {
      if (nextRoom) {
        await reserveRoom(nextRoom);
      }
      if (previousRoom) {
        await releaseRoom(previousRoom);
      }
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        roomNumber: nextRoom,
      },
      { new: true }
    );

    return res.json(updated);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Failed to update student" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const roomNumber = normalizeRoomNumber(student.roomNumber);
    if (roomNumber) {
      await releaseRoom(roomNumber);
    }

    await Student.findByIdAndDelete(req.params.id);

    return res.json({ message: "Student deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete student" });
  }
});

router.put("/allocate/:studentId", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const previousRoom = normalizeRoomNumber(student.roomNumber);
    const nextRoom = normalizeRoomNumber(req.body.roomNumber);

    if (!nextRoom) {
      return res.status(400).json({ message: "Please select a valid room" });
    }

    if (previousRoom !== nextRoom) {
      await reserveRoom(nextRoom);
      if (previousRoom) {
        await releaseRoom(previousRoom);
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.studentId,
      { roomNumber: nextRoom },
      { new: true }
    );

    return res.json({
      message: "Room allocated successfully",
      student: updatedStudent,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Failed to allocate room" });
  }
});

module.exports = router;
