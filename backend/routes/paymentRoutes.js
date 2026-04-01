const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const router = express.Router();
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const User = require("../models/User");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

const getRazorpayClient = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return null;

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

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

const isPaymentOwner = async (payment, reqUser) => {
  if (reqUser.role === "admin") return true;
  if (reqUser.role !== "user") return false;

  const studentId = await resolveStudentId(reqUser.id);
  return String(payment.studentId?._id || payment.studentId) === String(studentId);
};

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    if (Number(req.body.amount) <= 0) {
      return res.status(400).json({ message: "Amount should be greater than zero" });
    }

    const studentId = await resolveStudentId(req.body.studentId);

    const payment = new Payment({
      ...req.body,
      studentId,
      paidAt: req.body.status === "paid" ? new Date() : null,
      paymentMethod: req.body.status === "paid" ? req.body.paymentMethod || "cash" : null,
    });

    await payment.save();
    return res.json(payment);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create payment" });
  }
});

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const payments = await Payment.find().populate("studentId").sort({ paymentDate: -1 });
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch payments" });
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

    const payments = await Payment.find({ studentId: targetStudentId }).populate("studentId").sort({ paymentDate: -1 });
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user payments" });
  }
});

router.post("/:id/razorpay-order", authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("studentId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const isOwner = await isPaymentOwner(payment, req.user);
    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (payment.status === "paid") {
      return res.status(400).json({ message: "Payment is already completed" });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({
        message: "Razorpay is not configured on server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const amountInPaise = Math.round(Number(payment.amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `hms_${payment._id}_${Date.now()}`,
      notes: {
        paymentId: String(payment._id),
        studentId: String(payment.studentId?._id || payment.studentId),
      },
    });

    return res.json({
      key: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

router.post("/:id/razorpay-verify", authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findById(req.params.id).populate("studentId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const isOwner = await isPaymentOwner(payment, req.user);
    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay verification fields" });
    }

    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay secret not configured" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    payment.status = "paid";
    payment.paymentMethod = "razorpay";
    payment.paidAt = new Date();
    payment.transactionId = razorpay_payment_id;

    await payment.save();
    await payment.populate("studentId");

    return res.json({
      message: "Payment verified and completed successfully",
      payment,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to verify payment" });
  }
});

router.post("/:id/pay", authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("studentId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (req.user.role === "user") {
      const studentId = await resolveStudentId(req.user.id);
      if (String(payment.studentId?._id) !== String(studentId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    payment.status = "paid";
    payment.paymentMethod = "online";
    payment.paidAt = new Date();
    payment.transactionId = `TXN-${Date.now()}`;

    await payment.save();
    await payment.populate("studentId");

    return res.json({
      message: "Payment completed successfully",
      payment,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to complete payment" });
  }
});

router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    if (req.body.amount !== undefined && Number(req.body.amount) <= 0) {
      return res.status(400).json({ message: "Amount should be greater than zero" });
    }

    const updatePayload = { ...req.body };

    if (updatePayload.studentId) {
      updatePayload.studentId = await resolveStudentId(updatePayload.studentId);
    }

    if (updatePayload.status === "paid") {
      updatePayload.paidAt = updatePayload.paidAt || new Date();
      updatePayload.paymentMethod = updatePayload.paymentMethod || "offline";
    }

    if (updatePayload.status === "pending") {
      updatePayload.paidAt = null;
      updatePayload.paymentMethod = null;
      updatePayload.transactionId = null;
    }

    const payment = await Payment.findByIdAndUpdate(req.params.id, updatePayload, { new: true }).populate("studentId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.json(payment);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update payment" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    return res.json({ message: "Payment deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete payment" });
  }
});

module.exports = router;
