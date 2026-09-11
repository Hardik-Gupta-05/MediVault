const express = require('express');
const router = express.Router();
const {
  createRecord,
  getPatientRecords,
  getRecordById,
} = require('../controllers/recordController');

const multer = require('multer');

// Configure multer memory storage for PDF parsing / file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    next();
  });
};

router.post('/upload', uploadMiddleware, createRecord);
router.post('/', uploadMiddleware, createRecord);
router.get('/patient/:patientId', getPatientRecords);
router.get('/:id', getRecordById);

module.exports = router;

