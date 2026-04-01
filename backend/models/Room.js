const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({

  roomNumber:{
    type:String,
    required:true,
    unique:true
  },

  capacity:{
    type:Number,
    required:true
  },

  occupancy:{
    type:Number,
    default:0
  },

  status:{
    type:String,
    enum:["available","full"],
    default:"available"
  }

});

module.exports = mongoose.model("Room", roomSchema);