const pdfParse = require('pdf-parse');
const Record = require('../models/Record');

// @desc    Create/Upload a new medical record (supports PDF parsing)
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res) => {
  try {
    const { patient, institution, title, description, recordType } = req.body;
    let extractedText = '';
    let fileUrl = '';

    const uploadedFile = req.file || (req.files && req.files[0]);

    if (uploadedFile) {
      fileUrl = uploadedFile.path || uploadedFile.filename || uploadedFile.originalname || '';

      // Extract text if file is a PDF
      if (uploadedFile.mimetype === 'application/pdf' && uploadedFile.buffer) {
        try {
          const pdfData = await pdfParse(uploadedFile.buffer);
          extractedText = pdfData.text;
        } catch (pdfErr) {
          console.warn('PDF parsing warning:', pdfErr.message);
        }
      }
    }

    if (!patient || !institution || !title || !recordType) {
      return res.status(400).json({ message: 'Please provide patient, institution, title, and recordType' });
    }

    const record = await Record.create({
      patient,
      institution,
      title,
      description: description || extractedText,
      recordType,
      fileUrl,
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medical records for a patient
// @route   GET /api/records/patient/:patientId
// @access  Private
const getPatientRecords = async (req, res) => {
  try {
    const records = await Record.find({ patient: req.params.patientId })
      .populate('patient', 'name email')
      .populate('institution', 'name type');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get record by ID
// @route   GET /api/records/:id
// @access  Private
const getRecordById = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('institution', 'name type');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRecord,
  getPatientRecords,
  getRecordById,
};
