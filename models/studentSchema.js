const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isFromKiit: { type: Boolean, required: true },
    emailKiit: { type: String },
    emailNonKiit: { type: String },
    phone: { type: String, required: true, unique: true },
    internshipType: { 
      type: String, 
      required: true,
      enum: ["Technical", "Non-Technical", "Management", "Research", "Design"],
    },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
