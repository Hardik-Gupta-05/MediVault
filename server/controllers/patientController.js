const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

// JWT Generator
const generateToken = (id) => {
  return jwt.sign({ id, role: 'patient' }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '30d',
  });
};

// 1. Register Patient (Bina strict validation ke, seedha payload create karega)
exports.registerPatient = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    let hashedPassword = password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const patient = await Patient.create({
      ...rest,
      password: hashedPassword
    });

    res.status(201).json({
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      role: 'PATIENT',
      token: generateToken(patient._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Login Patient
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      role: 'PATIENT',
      token: generateToken(patient._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Patient Profile
exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('-password');
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientById = exports.getPatientProfile;