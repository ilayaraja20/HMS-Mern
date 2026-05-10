const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({

  email:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  }

});

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.comparePassword = async function (plainPassword) {
  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return bcrypt.compare(plainPassword, this.password);
  }

  const matched = this.password === plainPassword;
  if (matched) {
    this.password = await bcrypt.hash(plainPassword, 10);
    await this.save();
  }
  return matched;
};

module.exports = mongoose.model("Admin", adminSchema);
