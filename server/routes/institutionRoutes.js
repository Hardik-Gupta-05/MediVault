const express = require('express');
const router = express.Router();
const {
  registerInstitution,
  loginInstitution,
  getInstitutionProfile,
} = require('../controllers/institutionController');

router.post('/register', registerInstitution);
router.post('/login', loginInstitution);
router.get('/profile', getInstitutionProfile);

module.exports = router;
