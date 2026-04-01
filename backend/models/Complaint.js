const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Student",
    required:true
  },

  issue:{
    type:String,
    required:true
  },

  status:{
    type:String,
    enum:["pending","resolved"],
    default:"pending"
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model("Complaint",complaintSchema);