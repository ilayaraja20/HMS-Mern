const express = require("express");

const router = express.Router();
const Student = require("../models/Student");
const Room = require("../models/Room");
const Payment = require("../models/Payment");
const Complaint = require("../models/Complaint");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

router.get("/stats", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: "full" });

    const payments = await Payment.find();
    const feesCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingComplaints = await Complaint.countDocuments({ status: "pending" });

    res.json({
      totalStudents,
      totalRooms,
      occupiedRooms,
      feesCollected,
      pendingComplaints,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
