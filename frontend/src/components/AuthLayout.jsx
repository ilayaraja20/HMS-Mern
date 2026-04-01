import { Link } from "react-router-dom";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <header className="auth-topbar">
        <div className="auth-brand">
          <ApartmentIcon fontSize="small" />
          <span>Hostel Management System</span>
        </div>

        <Link to="/" className="auth-home-link">
          <HomeRoundedIcon fontSize="small" />
          <span>Home</span>
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-hero">
          <p className="auth-kicker">Secure Access Portal</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>

        <section className="auth-panel">{children}</section>
      </main>

      <footer className="auth-footer">
        <p>Hostel Management System</p>
        <span>Secure digital access for admins and students</span>
      </footer>
    </div>
  );
}

export default AuthLayout;
