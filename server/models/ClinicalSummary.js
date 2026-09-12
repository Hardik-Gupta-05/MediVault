const mongoose = require('mongoose');

const clinicalSummarySchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        unique: true
    },
    vitalAlerts: [String],
    activeConditions: [String],
    allergies: [String],
    activeMedications: [{
        name: String,
        dosage: String
    }],
    criticalLabTrends: [{
        testName: String,
        latestValue: String,
        flag: { type: String, enum: ['HIGH', 'LOW', 'NORMAL'] }
    }],
    executiveSummary: String,
    lastSynthesized: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ClinicalSummary', clinicalSummarySchema);