const express = require('express');
const router = express.Router();
const { getPatientSummary } = require('../controllers/summaryController');

router.get('/patient/:patientId', getPatientSummary);

module.exports = router;