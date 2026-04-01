import { Link } from "react-router-dom";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SchoolIcon from "@mui/icons-material/School";
import BedIcon from "@mui/icons-material/Bed";
import PaymentsIcon from "@mui/icons-material/Payments";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import "./Home.css";

const highlights = [
  {
    icon: <SchoolIcon />,
    title: "Student Records",
    description: "Maintain complete resident profiles, admission history, and room mapping in one place.",
  },
  {
    icon: <BedIcon />,
    title: "Room Allocation",
    description: "Track occupancy, vacancies, and room changes with a structured and transparent workflow.",
  },
  {
    icon: <PaymentsIcon />,
    title: "Payment Tracking",
    description: "Monitor fee status, due cycles, and payment logs for every student account.",
  },
  {
    icon: <BuildCircleIcon />,
    title: "Complaint Handling",
    description: "Capture complaints, assign ownership, and follow resolution updates without manual follow-up.",
  },
];

const stats = [
  { label: "Core Modules", value: "04+" },
  { label: "Operational Visibility", value: "100%" },
  { label: "Paperwork Reduced", value: "High" },
];

function Home() {
  return (
    <div className="hms-home">
      <header className="hms-topbar">
        <div className="hms-brand">
          <ApartmentIcon fontSize="small" />
          <span>Hostel Management System</span>
        </div>

        <nav className="hms-nav-actions">
          <Link to="/admin-login" className="hms-btn hms-btn-muted">
            Admin Login
          </Link>
          <Link to="/user-login" className="hms-btn hms-btn-primary">
            Student Login
          </Link>
        </nav>
      </header>

      <section className="hms-hero">
        <p className="hms-kicker">Streamlined Hostel Operations</p>
        <h1>Professional control over students, rooms, payments, and complaints.</h1>
        <p className="hms-hero-copy">
          HMS centralizes day-to-day hostel administration into a single workflow so teams can reduce manual work,
          respond faster, and keep records audit-ready.
        </p>
        <div className="hms-hero-actions">
          <Link to="/admin-login" className="hms-btn hms-btn-primary">
            Start as Admin
          </Link>
          <Link to="/user-login" className="hms-btn hms-btn-outline">
            Access Student Portal
          </Link>
        </div>
      </section>

      <section className="hms-stats" aria-label="Project highlights">
        {stats.map((item) => (
          <article key={item.label} className="hms-stat-card">
            <h3>{item.value}</h3>
            <p>{item.label}</p>
          </article>
        ))}
      </section>

      <section className="hms-features">
        <div className="hms-section-title">
          <h2>What this platform delivers</h2>
          <p>
            Purpose-built modules for hostel teams to manage operations with consistency and accountability.
          </p>
        </div>

        <div className="hms-feature-grid">
          {highlights.map((item) => (
            <article key={item.title} className="hms-feature-card">
              <div className="hms-feature-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hms-value-strip">
        <article>
          <VerifiedUserIcon />
          <div>
            <h3>Role-based access</h3>
            <p>Separate flows for admins and students keep actions secure and focused.</p>
          </div>
        </article>

        <article>
          <QueryStatsIcon />
          <div>
            <h3>Clear visibility</h3>
            <p>Structured dashboards help you make operational decisions quickly.</p>
          </div>
        </article>

        <article>
          <SupportAgentIcon />
          <div>
            <h3>Service-oriented workflow</h3>
            <p>Complaint and payment tracking improve response quality and trust.</p>
          </div>
        </article>
      </section>

      <footer className="hms-footer">
        <p>Hostel Management System</p>
        <span>Professional digital operations for modern hostels</span>
      </footer>
    </div>
  );
}

export default Home;
