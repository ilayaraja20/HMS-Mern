function Hero() {
  return (
    <div style={{
      textAlign: "center",
      padding: "120px 20px",
      background: "#f8fafc"
    }}>
      <h1>Smart Hostel Management System</h1>

      <p style={{fontSize:"18px", marginTop:"20px"}}>
        Manage students, rooms, payments and complaints efficiently.
      </p>

      <button style={{
        marginTop:"30px",
        padding:"10px 20px",
        background:"#2563eb",
        color:"white",
        border:"none",
        borderRadius:"5px"
      }}>
        Get Started
      </button>

    </div>
  );
}

export default Hero;