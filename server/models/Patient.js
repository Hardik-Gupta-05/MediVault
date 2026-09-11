const mongoose = require('mongoose');

const nomineeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  relation: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  aadhaar: {
    type: String,
    required: true
  }
});

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true
  },
  nominees: [nomineeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
