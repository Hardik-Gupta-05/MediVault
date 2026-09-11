const Consent = require('../models/Consent');

// 1. Doctor/Institution requests access
exports.requestConsent = async (req, res) => {
  try {
    const { patient, institution, purpose, durationDays = 7 } = req.body;

    if (!patient || !institution || !purpose) {
      return res.status(400).json({ message: "patient, institution, and purpose are required" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const consent = await Consent.create({
      patient,
      institution,
      purpose,
      status: 'PENDING',
      expiresAt
    });

    res.status(201).json(consent);
  } catch (error) {
    res.status(500).json({ message: "Failed to request consent", error: error.message });
  }
};

// 2. Patient updates consent status (APPROVED / REJECTED / REVOKED)
exports.updateConsentStatus = async (req, res) => {
  try {
    const { consentId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'REVOKED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const consent = await Consent.findByIdAndUpdate(
      consentId,
      { status },
      { new: true }
    );

    if (!consent) {
      return res.status(404).json({ message: "Consent request not found" });
    }

    res.status(200).json(consent);
  } catch (error) {
    res.status(500).json({ message: "Failed to update consent", error: error.message });
  }
};

// 3. Get all consent requests for a specific patient
exports.getPatientConsents = async (req, res) => {
  try {
    const { patientId } = req.params;
    const consents = await Consent.find({ patient: patientId }).sort({ createdAt: -1 });
    res.status(200).json(consents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch consents", error: error.message });
  }
};

// 4. Verify if institution has active approval
exports.verifyActiveConsent = async (req, res) => {
  try {
    const { patientId, institutionId } = req.query;

    const consent = await Consent.findOne({
      patient: patientId,
      institution: institutionId,
      status: 'APPROVED',
      expiresAt: { $gte: new Date() }
    });

    res.status(200).json({ hasAccess: !!consent, consent });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};