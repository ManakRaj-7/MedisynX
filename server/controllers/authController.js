const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, specialization, email, password } = req.body;

    if (!name || !specialization || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(409).json({ message: 'Doctor already exists.' });
    }

    const doctor = await Doctor.create({ name, specialization, email, password });

    const accessToken = generateToken(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRE
    );

    const refreshToken = generateToken(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRE
    );

    res.status(201).json({ doctor, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const accessToken = generateToken(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRE
    );

    const refreshToken = generateToken(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRE
    );

    res.status(200).json({ doctor, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token.' });
      }

      const accessToken = generateToken(
        { id: decoded.id, role: decoded.role },
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRE
      );

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    next(error);
  }
};

const multer = require('multer');
const sharp = require('sharp');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'), false);
  }
});

exports.uploadAvatar = [
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      // Compress and resize using sharp
      const compressedBuffer = await sharp(req.file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      const base64Image = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;

      const doctor = await Doctor.findByIdAndUpdate(
        req.user.id,
        { profileImage: base64Image, avatarId: '' },
        { new: true }
      ).select('-password');

      res.status(200).json(doctor);
    } catch (error) {
      next(error);
    }
  }
];

const bcrypt = require('bcryptjs');

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'User not found.' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(newPassword, salt);
    await doctor.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const updates = req.body;
    
    // Don't allow password update here
    delete updates.password;
    delete updates.email;

    const doctor = await Doctor.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};
