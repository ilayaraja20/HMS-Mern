const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const User = require("../models/User");
const Student = require("../models/Student");
const { authenticate, JWT_SECRET } = require("../middleware/authMiddleware");

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const findStudentCandidateForUser = async (user) => {
  const existingMappedStudent = await Student.findOne({ userId: user._id });
  if (existingMappedStudent) {
    return existingMappedStudent;
  }

  const phone = String(user.phone || "").trim();
  if (phone) {
    const phoneMatch = await Student.findOne({ userId: null, contact: phone });
    if (phoneMatch) {
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
      return nameMatches[0];
    }

    if (nameMatches.length > 1 && phone) {
      const preciseMatch = nameMatches.find((item) => normalizeValue(item.contact) === normalizeValue(phone));
      if (preciseMatch) {
        return preciseMatch;
      }
    }
  }

  return null;
};

const ensureStudentProfile = async (user) => {
  let student = await findStudentCandidateForUser(user);

  if (!student) {
    student = new Student({
      userId: user._id,
      name: user.name || "",
      department: "",
      year: "",
      contact: user.phone || "",
      roomNumber: null,
    });

    await student.save();
    return student;
  }

  let shouldSave = false;

  if (!student.userId) {
    student.userId = user._id;
    shouldSave = true;
  }

  if (!student.name && user.name) {
    student.name = user.name;
    shouldSave = true;
  }

  if (!student.contact && user.phone) {
    student.contact = user.phone;
    shouldSave = true;
  }

  if (shouldSave) {
    await student.save();
  }

  return student;
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();
    await ensureStudentProfile(user);

    return res.json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let passwordMatched = false;

    if (typeof user.password === "string" && user.password.startsWith("$2")) {
      passwordMatched = await bcrypt.compare(password, user.password);
    } else {
      passwordMatched = user.password === password;
      if (passwordMatched) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const student = await ensureStudentProfile(user);

    const token = jwt.sign(
      {
        id: user._id,
        role: "user",
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        studentId: student?._id || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const isSameUser = req.user.role === "user" && req.user.id === req.params.id;
    const isAdmin = req.user.role === "admin";

    if (!isSameUser && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const student = await ensureStudentProfile(user);

    return res.json({
      ...user.toObject(),
      studentId: student?._id || null,
      roomNumber: student?.roomNumber || null,
      department: student?.department || "",
      year: student?.year || "",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

module.exports = router;
