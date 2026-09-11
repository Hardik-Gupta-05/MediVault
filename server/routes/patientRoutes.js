const express = require('express');
const router = express.Router();
const {
  registerPatient,
  loginPatient,
  getPatientProfile
} = require('../controllers/patientController');

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/profile/:id', getPatientProfile);
router.get('/:id', getPatientProfile);

module.exports = router;
