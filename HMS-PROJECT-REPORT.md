# HOSTEL MANAGEMENT SYSTEM
## PROJECT DOCUMENTATION REPORT

### Submitted By
- Name: ____________________
- Register Number: ____________________
- Department: M.Sc. Information Technology

### Institution
- Government Arts College (Autonomous), Coimbatore
- Academic Year: 2025-2026

## CERTIFICATE
This is to certify that the project work titled **"Hostel Management System"** is a bonafide record of work carried out as part of the academic requirements for the award of the Degree in Information Technology.

## DECLARATION
I hereby declare that this project report entitled **"Hostel Management System"** is an original work carried out by me and has not been submitted previously for the award of any degree or diploma.

## ACKNOWLEDGEMENT
I express my sincere gratitude to the Head of the Department, my project guide, faculty members, and friends for their support and guidance throughout the development of this project.

## TABLE OF CONTENTS
1. INTRODUCTION
1.1 Project Overview
2. SYSTEM SPECIFICATIONS
2.1 Hardware Requirements
2.2 Software Requirements
3. SYSTEM STUDY AND ANALYSIS
3.1 Existing System
3.2 Proposed System
4. SYSTEM DESIGN
4.1 System Architecture
4.2 Database Design
4.3 Module Description
4.4 Input Design
4.5 Output Design
5. SYSTEM DEVELOPMENT
5.1 Development Methodology
6. SYSTEM TESTING AND IMPLEMENTATION
6.1 System Testing
6.2 System Implementation
CONCLUSION
FUTURE ENHANCEMENT
BIBLIOGRAPHY
ANNEXURE

## ABSTRACT
The Hostel Management System (HMS) is a full-stack web application designed to digitize and streamline hostel administration and student services. The system provides role-based secure access for administrators and students, allowing efficient management of student records, room allocation, payment operations, complaint tracking, and dashboard monitoring.

The application is built with a modern MERN-style stack. The backend uses Node.js, Express, MongoDB, JWT-based authentication, and Razorpay payment verification for secure online transactions. The frontend uses React with Material UI and a responsive dashboard-based interface. Recent improvements include security hardening, modular architecture separation, route-level code splitting, robust payment verification, and backend API test coverage.

The HMS improves operational efficiency by reducing manual records, improving transparency in fee tracking and complaints, and providing real-time visibility into hostel operations.

## CHAPTER I
## INTRODUCTION

### 1.1 PROJECT OVERVIEW
Hostel operations are often handled manually, leading to delays, inconsistent records, and poor transparency. The Hostel Management System was developed to centralize all hostel workflows into a single secure platform.

Major objectives:
- Maintain student and room records with role-based access.
- Track payment dues and paid records with online payment support.
- Enable student complaint submission and admin resolution flow.
- Provide analytics-oriented dashboards for operational decisions.

Problem Statement:
Traditional manual hostel management is time-consuming and error-prone. There is a need for a secure, auditable, and user-friendly system that integrates administration and student services in one digital workflow.

Scope:
- Admin panel for student, room, payment, and complaint operations.
- Student portal for profile view, complaint raising, and online payment.
- Secure authentication and API authorization.

## CHAPTER II
## SYSTEM SPECIFICATIONS

### 2.1 HARDWARE REQUIREMENTS
Minimum:
- Processor: Intel i3 / equivalent
- RAM: 4 GB (8 GB recommended)
- Storage: 2 GB free space
- Internet: Required for API services and Razorpay checkout

### 2.2 SOFTWARE REQUIREMENTS
Development Environment:
- OS: Windows 10/11
- Node.js: v18+
- npm: v9+
- MongoDB: Local or cloud instance
- VS Code / any IDE

Backend Stack:
- Express.js
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- Razorpay SDK

Frontend Stack:
- React (Vite)
- Material UI (MUI)
- React Router
- Axios
- Bootstrap (base styles)

Testing/Quality:
- Node test runner
- Supertest
- mongodb-memory-server
- ESLint

## CHAPTER III
## SYSTEM STUDY AND ANALYSIS

### 3.1 EXISTING SYSTEM
In a manual system:
- Student and room records are maintained in notebooks or spreadsheets.
- Payment status is difficult to monitor accurately.
- Complaint resolution lacks systematic tracking.
- Report generation and audit trails are weak.

Limitations:
- Data redundancy and human errors.
- No centralized role-based access.
- Low scalability and poor data visibility.

### 3.2 PROPOSED SYSTEM
The proposed HMS introduces:
- JWT-based secure login for admin and student users.
- CRUD modules for students, rooms, payments, and complaints.
- Student-facing online payment flow via Razorpay.
- Dashboard insights for occupancy, payment, and complaint metrics.
- Responsive, professional UI for both admin and student workflows.

Benefits:
- Improved operational speed and accuracy.
- Better transparency and accountability.
- Real-time data and centralized monitoring.

## CHAPTER IV
## SYSTEM DESIGN

### 4.1 SYSTEM ARCHITECTURE
Architecture Style: Client-Server
- Frontend: React SPA
- Backend: Express REST API
- Database: MongoDB
- External Gateway: Razorpay (checkout + signature verification)

Request Flow:
1. User logs in and receives JWT token.
2. Frontend sends token in Authorization header.
3. Backend validates role and token using middleware.
4. Data is persisted/fetched from MongoDB.
5. For payments, order creation + verification is handled server-side.

### 4.2 DATABASE DESIGN
Primary collections:
- Admin: email, password (hashed)
- User: name, email, phone, password (hashed)
- Student: linked userId, department, year, contact, roomNumber
- Room: roomNumber, capacity, occupancy, status
- Payment: studentId, amount, status, paymentMethod, transactionId, gatewayOrderId
- Complaint: studentId, issue, status, createdAt

Relationships:
- `Student.userId` -> `User._id`
- `Payment.studentId` -> `Student._id`
- `Complaint.studentId` -> `Student._id`

### 4.3 MODULE DESCRIPTION
Admin Modules:
- Dashboard
- Student Management
- Room Management
- Payment Operations
- Complaint Operations

Student Modules:
- Student Dashboard
- My Payments (Razorpay integration + receipt download)
- My Complaints

Security Modules:
- Authentication middleware
- Role-based route guards
- Token-based protected API access

### 4.4 INPUT DESIGN
Input forms include:
- Admin login / student login / student registration
- Add/edit students and room allocation
- Add/edit rooms with occupancy constraints
- Record payment, update payment status
- Raise complaint and update status

Validation rules:
- Required fields enforced in frontend and backend
- Positive numeric constraints for amount/capacity
- Authorization checks on protected routes

### 4.5 OUTPUT DESIGN
Output screens:
- Role-based dashboards
- Real-time cards (counts/summary)
- Tabular modules with search/filter/action controls
- Student payment receipts and transaction visibility

## CHAPTER V
## SYSTEM DEVELOPMENT

### 5.1 DEVELOPMENT METHODOLOGY
Methodology followed:
- Incremental feature development
- Module-wise testing and UI refinements
- Security-first backend fixes
- Continuous lint/build/test verification

Recent engineering improvements:
- Secure admin password hashing and verification
- Mandatory environment-based secrets (`JWT_SECRET`, `MONGO_URI`)
- Correct dashboard fee calculation (paid-only)
- Room status recalculation consistency
- Route-level lazy loading and bundle chunk splitting
- API test suite for core flows

## CHAPTER VI
## SYSTEM TESTING AND IMPLEMENTATION

### 6.1 SYSTEM TESTING
Testing types performed:
- Backend API unit/integration testing (5 core test cases)
- Frontend lint validation (ESLint)
- Frontend production build validation (Vite)
- Backend syntax checks

Validated scenarios:
- Admin login success flow
- Student login success flow
- Room allocation updates occupancy
- Razorpay order creation flow
- Razorpay signature verification flow

Current status:
- Backend API tests: PASS (5/5)
- Frontend lint: PASS
- Frontend build: PASS

### 6.2 SYSTEM IMPLEMENTATION
Implementation highlights:
- Backend configured with modular routes and middleware
- Frontend configured with protected routes for admin and student
- Payment verification secured with HMAC signature matching
- Deployment-ready environment variable architecture

Suggested deployment:
- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas/local

## CONCLUSION
The Hostel Management System successfully addresses hostel administration challenges by providing a secure, scalable, and user-friendly platform. The implemented modules improve data consistency, operational efficiency, and service transparency for both administrators and students.

## FUTURE ENHANCEMENT
- PDF-native receipt generation
- Notification system (email/SMS/WhatsApp)
- Advanced analytics and downloadable reports
- Fine-grained audit logs
- Multi-hostel/multi-branch support
- UPI and additional payment gateway options

## BIBLIOGRAPHY
- Node.js Documentation
- Express.js Documentation
- MongoDB and Mongoose Documentation
- React and Vite Documentation
- Material UI Documentation
- Razorpay API Documentation

## ANNEXURE
- Source code screenshots
- Dashboard screenshots
- API endpoint list
- Test output logs
