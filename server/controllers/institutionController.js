const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id, role: 'institution' }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '30d',
  });
};

// @desc    Register a new institution
// @route   POST /api/institutions/register
// @access  Public
const registerInstitution = async (req, res) => {
  try {
    const { name, email, password, type, licenseNumber, contactNumber, address } = req.body;

    if (!name || !email || !password || !type) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password, type)' });
    }

    const institutionExists = await Institution.findOne({ email });
    if (institutionExists) {
      return res.status(400).json({ message: 'Institution with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const institution = await Institution.create({
      name,
      email,
      password: hashedPassword,
      type,
      licenseNumber,
      contactNumber,
      address,
    });

    if (institution) {
      res.status(201).json({
        _id: institution._id,
        name: institution.name,
        email: institution.email,
        type: institution.type,
        licenseNumber: institution.licenseNumber,
        contactNumber: institution.contactNumber,
        address: institution.address,
        token: generateToken(institution._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid institution data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate institution & get token
// @route   POST /api/institutions/login
// @access  Public
const loginInstitution = async (req, res) => {
  try {
    const { email, password } = req.body;

    const institution = await Institution.findOne({ email });
    if (institution && (await bcrypt.compare(password, institution.password))) {
      res.json({
        _id: institution._id,
        name: institution.name,
        email: institution.email,
        type: institution.type,
        token: generateToken(institution._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get institution profile
// @route   GET /api/institutions/profile
// @access  Private
const getInstitutionProfile = async (req, res) => {
  try {
    res.status(200).json({ message: 'Institution profile controller placeholder' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerInstitution,
  loginInstitution,
  getInstitutionProfile,
};
