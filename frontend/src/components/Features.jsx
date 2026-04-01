import SchoolIcon from "@mui/icons-material/School";
import HotelIcon from "@mui/icons-material/Hotel";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

function Features() {
  return (
    <div style={{ padding: "40px 20px 80px 20px", background: "#f8fafc" }}>

      <h2 style={{ textAlign: "center", marginBottom: "60px", fontSize: "36px" }}>
        System Features
      </h2>

      <div className="container">
        <div className="row g-4 text-center">

          {/* Student Management */}
          <div className="col-md-3">
            <div className="card shadow-lg h-100 feature-card">
              <div className="card-body p-4">
                <SchoolIcon style={{ fontSize: 50, color: "#2563eb" }} />
                <h4 className="card-title mt-3">Student Management</h4>
                <p className="card-text mt-2">
                  Add, update and manage hostel students
                </p>
              </div>
            </div>
          </div>

          {/* Room Management */}
          <div className="col-md-3">
            <div className="card shadow-lg h-100 feature-card">
              <div className="card-body p-4">
                <HotelIcon style={{ fontSize: 50, color: "#16a34a" }} />
                <h4 className="card-title mt-3">Room Management</h4>
                <p className="card-text mt-2">
                  Track room availability and capacity
                </p>
              </div>
            </div>
          </div>

          {/* Fee Management */}
          <div className="col-md-3">
            <div className="card shadow-lg h-100 feature-card">
              <div className="card-body p-4">
                <PaymentsIcon style={{ fontSize: 50, color: "#f59e0b" }} />
                <h4 className="card-title mt-3">Fee Management</h4>
                <p className="card-text mt-2">
                  Monitor payments and fee history
                </p>
              </div>
            </div>
          </div>

          {/* Complaint System */}
          <div className="col-md-3">
            <div className="card shadow-lg h-100 feature-card">
              <div className="card-body p-4">
                <ReportProblemIcon style={{ fontSize: 50, color: "#ef4444" }} />
                <h4 className="card-title mt-3">Complaint System</h4>
                <p className="card-text mt-2">
                  Students can submit complaints easily
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Features;