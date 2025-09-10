const mongoose = require("mongoose");
const enrollSchoolSchema = new mongoose.Schema(
  {
    enrollCode: { type: String, required: true },
    studentName: { type: String, required: true },
    studentAge: { type: Number, required: true },
    studentDob: { type: Date, required: true },
    studentGender: { type: String, enum: ["male", "female", "other"] },
    parentName: { type: String, required: true },
    parentGender: { type: String, enum: ["male", "female", "other"] },
    parentDob: { type: Date, required: true },
    IDCard: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    relationship: { type: String, required: true },
    reason: { type: String },
    note: { type: String },
    state: {
      type: String,
      enum: ["Chờ xác nhận", "Chờ xử lý", "Hoàn thành", "Xử lý lỗi"],
      default: "Chờ xác nhận"
    },
    signInfo: {
      isSigned: { type: Boolean, default: false },
      signedAt: { type: Date },
      signedBy: { type: String },
      signedEmail: { type: String },
      signedIP: { type: String },
      signatureText: { type: String },
    }

  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("enrollSchool", enrollSchoolSchema);
