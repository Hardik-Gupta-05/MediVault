const express = require('express');
const router = express.Router();
const {
  requestConsent,
  updateConsentStatus,
  getPatientConsents,
  verifyActiveConsent
} = require('../controllers/consentController');

// POST /api/consent/request -> Doctor requests record access
router.post('/request', requestConsent);

// PATCH /api/consent/:consentId/status -> Patient grants/rejects
router.patch('/:consentId/status', updateConsentStatus);

// GET /api/consent/patient/:patientId -> List requests on patient dashboard
router.get('/patient/:patientId', getPatientConsents);

// GET /api/consent/verify -> Check access before revealing files
router.get('/verify', verifyActiveConsent);

module.exports = router;