const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_value";
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_sample";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "test_razorpay_secret";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = require("../app");
const paymentRoutes = require("../routes/paymentRoutes");

const Admin = require("../models/Admin");
const User = require("../models/User");
const Student = require("../models/Student");
const Room = require("../models/Room");
const Payment = require("../models/Payment");
const Complaint = require("../models/Complaint");

let mongoServer;

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

const clearDatabase = async () => {
  const collections = [Admin, User, Student, Room, Payment, Complaint];
  for (const model of collections) {
    await model.deleteMany({});
  }
};

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

test.beforeEach(async () => {
  await clearDatabase();
  paymentRoutes.__resetRazorpayClientFactory();
});

test.after(async () => {
  paymentRoutes.__resetRazorpayClientFactory();
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test("admin login succeeds with hashed password and returns JWT", async () => {
  await Admin.create({ email: "admin@hms.com", password: "Admin@123" });

  const res = await request(app).post("/api/admin/login").send({
    email: "admin@hms.com",
    password: "Admin@123",
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.message, "Login successful");
  assert.ok(res.body.token);
});

test("user login succeeds and returns user token", async () => {
  const hashedPassword = await bcrypt.hash("User@123", 10);
  const user = await User.create({
    name: "Sree",
    email: "sree@hms.com",
    phone: "9000000001",
    password: hashedPassword,
  });

  await Student.create({
    userId: user._id,
    name: "Sree",
    department: "CSE",
    year: "3",
    contact: "9000000001",
  });

  const res = await request(app).post("/api/users/login").send({
    email: "sree@hms.com",
    password: "User@123",
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.message, "Login successful");
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, "sree@hms.com");
});

test("room allocation API updates student room and room occupancy", async () => {
  const adminToken = signToken({ id: new mongoose.Types.ObjectId().toString(), role: "admin", email: "admin@hms.com" });

  const room = await Room.create({
    roomNumber: "A-101",
    capacity: 2,
    occupancy: 0,
    status: "available",
  });

  const student = await Student.create({
    name: "Arun",
    department: "ECE",
    year: "2",
    contact: "9000000002",
    roomNumber: null,
  });

  const res = await request(app)
    .put(`/api/students/allocate/${student._id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ roomNumber: room.roomNumber });

  assert.equal(res.status, 200);
  assert.equal(res.body.message, "Room allocated successfully");

  const updatedStudent = await Student.findById(student._id);
  const updatedRoom = await Room.findById(room._id);

  assert.equal(updatedStudent.roomNumber, "A-101");
  assert.equal(updatedRoom.occupancy, 1);
});

test("razorpay order API creates order for pending student payment", async () => {
  const user = await User.create({
    name: "Kavin",
    email: "kavin@hms.com",
    phone: "9000000003",
    password: await bcrypt.hash("User@123", 10),
  });

  const student = await Student.create({
    userId: user._id,
    name: "Kavin",
    department: "IT",
    year: "4",
    contact: "9000000003",
  });

  const payment = await Payment.create({
    studentId: student._id,
    amount: 2500,
    status: "pending",
  });

  paymentRoutes.__setRazorpayClientFactory(() => ({
    orders: {
      create: async ({ amount, currency }) => ({
        id: "order_test_123",
        amount,
        currency,
      }),
    },
  }));

  const userToken = signToken({ id: user._id.toString(), role: "user", email: user.email });

  const res = await request(app)
    .post(`/api/payments/${payment._id}/razorpay-order`)
    .set("Authorization", `Bearer ${userToken}`)
    .send();

  assert.equal(res.status, 200);
  assert.equal(res.body.orderId, "order_test_123");
  assert.equal(res.body.currency, "INR");

  const updatedPayment = await Payment.findById(payment._id);
  assert.equal(updatedPayment.gatewayOrderId, "order_test_123");
});

test("razorpay verify API marks payment as paid with valid signature", async () => {
  const user = await User.create({
    name: "Mithran",
    email: "mithran@hms.com",
    phone: "9000000004",
    password: await bcrypt.hash("User@123", 10),
  });

  const student = await Student.create({
    userId: user._id,
    name: "Mithran",
    department: "MECH",
    year: "1",
    contact: "9000000004",
  });

  const payment = await Payment.create({
    studentId: student._id,
    amount: 3200,
    status: "pending",
    gatewayOrderId: "order_verify_123",
  });

  const paymentId = "pay_verify_123";
  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`order_verify_123|${paymentId}`)
    .digest("hex");

  const userToken = signToken({ id: user._id.toString(), role: "user", email: user.email });

  const res = await request(app)
    .post(`/api/payments/${payment._id}/razorpay-verify`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      razorpay_order_id: "order_verify_123",
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.payment.status, "paid");
  assert.equal(res.body.payment.paymentMethod, "razorpay");
  assert.equal(res.body.payment.transactionId, paymentId);
});
