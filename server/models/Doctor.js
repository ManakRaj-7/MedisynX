const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    
    // Professional Details
    qualification: { type: String },
    experience: { type: Number, default: 0 },
    hospital: { type: String },
    licenseNumber: { type: String },
    bio: { type: String },
    consultationFee: { type: Number, default: 0 },
    languages: [{ type: String }],
    availability: { type: String },
    
    // Profile Customization
    profileImage: { type: String }, // URL or Base64
    avatarId: { type: String }, // For selected default avatars
    
    // AI Preferences
    aiPreferences: {
      model: { type: String, default: 'gemini-2.5-flash' },
      responseStyle: { type: String, default: 'detailed' },
      confidenceThreshold: { type: Number, default: 0.6 },
      autoGeneratePrescription: { type: Boolean, default: false }
    },
    
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
doctorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
