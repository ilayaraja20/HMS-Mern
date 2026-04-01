const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  studentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  amount:{
    type:Number,
    required:true
  },

  paymentDate:{
    type:Date,
    default:Date.now
  },

 status:{
  type:String,
  enum:["paid","pending"],
  default:"pending"
},

  paidAt:{
    type:Date,
    default:null
  },

  paymentMethod:{
    type:String,
    default:null
  },

  transactionId:{
    type:String,
    default:null
  }

});

module.exports = mongoose.model("Payment", paymentSchema);
