const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    medicalHistory: [
      {
        condition: String,
        date: { type: Date, default: Date.now },
      },
    ],
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
  },
  { timestamps: true }
);

// Compound unique index: same phone can exist for different doctors, but not same doctor
patientSchema.index({ phone: 1, doctorId: 1 }, { unique: true });

module.exports = mongoose.model('Patient', patientSchema);
