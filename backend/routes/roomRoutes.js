const express = require("express");

const router = express.Router();
const Room = require("../models/Room");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    if (Number(req.body.capacity) <= 0) {
      return res.status(400).json({ message: "Capacity should be greater than zero" });
    }

    const room = new Room(req.body);
    await room.save();
    return res.json(room);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create room" });
  }
});

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    return res.json(rooms);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const existingRoom = await Room.findById(req.params.id);

    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (req.body.capacity !== undefined && Number(req.body.capacity) < Number(existingRoom.occupancy)) {
      return res.status(400).json({ message: "Capacity cannot be less than current occupancy" });
    }

    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });

    room.status = Number(room.occupancy) >= Number(room.capacity) ? "full" : "available";
    await room.save();

    return res.json(room);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update room" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (Number(room.occupancy) > 0) {
      return res.status(400).json({ message: "Cannot delete an occupied room" });
    }

    await Room.findByIdAndDelete(req.params.id);
    return res.json({ message: "Room deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete room" });
  }
});

module.exports = router;
