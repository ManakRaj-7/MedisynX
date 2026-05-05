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
