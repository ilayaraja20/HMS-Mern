const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    unique: true,
    sparse: true
  },

  name:String,
  department:String,
  year:String,
  contact:String,

  roomNumber:{
    type:String,
    default:null
  }

});

module.exports = mongoose.model("Student", studentSchema);
