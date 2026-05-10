const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const Admin = require("../models/Admin");
const { JWT_SECRET } = require("../middleware/authMiddleware");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const passwordMatched = await admin.comparePassword(password);

    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
