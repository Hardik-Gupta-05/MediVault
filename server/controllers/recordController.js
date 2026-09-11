const Record = require('../models/Record');
const fs = require('fs');
const path = require('path');

// @desc    Upload new medical record
// @route   POST /api/records/upload
const createRecord = async (req, res) => {
  try {
    const { patient, institution, title, recordType, description } = req.body;
    const uploadedFile = req.file || (req.files && req.files[0]);

    if (!patient || !title) {
      return res.status(400).json({ message: 'Patient reference and record title are required.' });
    }

    let fileUrl = '';
    if (uploadedFile) {
      fileUrl = `uploads/${uploadedFile.filename}`;
    }

    const record = await Record.create({
      patient,
      institution: institution || null,
      title,
      recordType: recordType || 'LAB_REPORT',
      description: description || '',
      fileUrl
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Upload error', error: error.message });
  }
};

// @desc    Get all records for a patient
// @route   GET /api/records/patient/:patientId
const getPatientRecords = async (req, res) => {
  try {
    const records = await Record.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch records', error: error.message });
  }
};

// @desc    Delete medical record & remove file binary
// @route   DELETE /api/records/:id
const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Unlink local file if exists
    if (record.fileUrl) {
      const absoluteFilePath = path.join(__dirname, '..', record.fileUrl);
      if (fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
      }
    }

    await Record.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Record purged successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
};

module.exports = {
  createRecord,
  getPatientRecords,
  deleteRecord
};