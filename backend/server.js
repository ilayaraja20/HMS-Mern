import cors from "cors";
app.use(cors());
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = require("./app");

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is required. Set MONGO_URI in backend/.env");
}

mongoose.connect(MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});
