const express = require("express");

const router = express.Router();
const Complaint = require("../models/Complaint");
const Student = require("../models/Student");
const User = require("../models/User");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const findAndLinkStudentForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const phone = String(user.phone || "").trim();
  if (phone) {
    const phoneMatch = await Student.findOne({ userId: null, contact: phone });
    if (phoneMatch) {
      phoneMatch.userId = user._id;
      await phoneMatch.save();
      return phoneMatch;
    }
  }

  const name = String(user.name || "").trim();
  if (name) {
    const nameMatches = await Student.find({
      userId: null,
      name: { $regex: `^${escapeRegExp(name)}$`, $options: "i" },
    });

    if (nameMatches.length === 1) {
      nameMatches[0].userId = user._id;
      await nameMatches[0].save();
      return nameMatches[0];
    }

    if (nameMatches.length > 1 && phone) {
      const preciseMatch = nameMatches.find((item) => normalizeValue(item.contact) === normalizeValue(phone));
      if (preciseMatch) {
        preciseMatch.userId = user._id;
        await preciseMatch.save();
        return preciseMatch;
      }
    }
  }

  return null;
};

const resolveStudentId = async (userIdOrStudentId) => {
  const mappedStudent = await Student.findOne({ userId: userIdOrStudentId });
  if (mappedStudent) return mappedStudent._id;

  const directStudent = await Student.findById(userIdOrStudentId);
  if (directStudent) return directStudent._id;

  const linkedStudent = await findAndLinkStudentForUser(userIdOrStudentId);
  if (linkedStudent) return linkedStudent._id;

  return userIdOrStudentId;
};

router.post("/", authenticate, async (req, res) => {
  try {
    const complaintPayload = { ...req.body };

    if (req.user.role === "user") {
      complaintPayload.studentId = await resolveStudentId(req.user.id);
    } else if (complaintPayload.studentId) {
      complaintPayload.studentId = await resolveStudentId(complaintPayload.studentId);
    }

    const complaint = new Complaint(complaintPayload);
    await complaint.save();

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create complaint" });
  }
});

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("studentId").sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

router.get("/user/:userId", authenticate, async (req, res) => {
  try {
    const isSameUser = req.user.role === "user" && req.user.id === req.params.userId;
    const isAdmin = req.user.role === "admin";

    if (!isSameUser && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const targetStudentId = isSameUser
      ? await resolveStudentId(req.user.id)
      : await resolveStudentId(req.params.userId);

    const complaints = await Complaint.find({ studentId: targetStudentId }).populate("studentId").sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user complaints" });
  }
});

router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update complaint" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    return res.json({ message: "Complaint deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete complaint" });
  }
});

module.exports = router;
