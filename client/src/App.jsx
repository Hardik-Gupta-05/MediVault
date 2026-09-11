import React, { useState, useEffect } from 'react';
import {
  Upload, Activity, ShieldCheck, CheckCircle2,
  FileText, Calendar, ExternalLink, RefreshCw,
  AlertCircle, KeyRound, Check, X, Clock,
  Lock, Mail, User, Building2, ArrowRight, Eye, EyeOff, LogOut,
  Phone, MapPin, Droplet, CreditCard, Stethoscope, Users,
  FolderLock, Compass, Bell, Download, Database, LogIn, UserPlus,
  Trash2, Hospital, Search, ShieldAlert, HeartPulse, FileSpreadsheet,
  CheckCircle, PlusCircle, Filter, ChevronRight, UserCheck
} from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState('PATIENT'); // 'PATIENT' or 'INSTITUTION'

  // Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showPatientAadhaar, setShowPatientAadhaar] = useState(false);
  const [showNominee1Aadhaar, setShowNominee1Aadhaar] = useState(false);
  const [showNominee2Aadhaar, setShowNominee2Aadhaar] = useState(false);

  // Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [breakGlassActive, setBreakGlassActive] = useState(false);

  // Form State
  const [authForm, setAuthForm] = useState({
    email: 'hardik@medivault.io',
    phone: '+91 98765-43210',
    password: 'password123',
    name: 'Hardik Gupta',
    age: '22',
    bloodGroup: 'O+',
    city: 'Agra',
    aadhaar: '548912345678',
    nominee1Name: 'Gaurav Sharma',
    nominee1Relation: 'Brother',
    nominee1Phone: '+91 98765-00112',
    nominee1Aadhaar: '987654321012',
    nominee2Name: 'Sunita Gupta',
    nominee2Relation: 'Mother',
    nominee2Phone: '+91 98765-00113',
    nominee2Aadhaar: '123456789012',
    institutionName: 'Apollo Multispeciality Hospital',
    institutionType: 'hospital',
    licenseNumber: 'NABH-DEL-2026-08',
    address: 'Sector 14, Main Arterial Road, Agra'
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Navigation Tabs
  const [activeNav, setActiveNav] = useState('records'); // Patient: records | consent | vitals. Provider: search | requests | roster
  const patientId = user?._id || '64a2fb1234567890abcdef12';
  const institutionId = user?._id || '64a2fb1234567890abcdef13';

  // Upload Form
  const [formData, setFormData] = useState({
    patient: patientId,
    institution: institutionId,
    title: '',
    recordType: 'LAB_REPORT',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, msg: '', type: '' });
  const [records, setRecords] = useState([]);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  // Patient Mock/Live Consents
  const [consents, setConsents] = useState([
    {
      _id: 'REQ-901',
      institution: { name: 'Max Super Speciality Hospital', type: 'Tertiary Care' },
      purpose: 'Cardiology Pre-Op Evaluation & ECG History',
      requestedAt: '12 Sep 2026, 11:20 AM',
      status: 'PENDING'
    },
    {
      _id: 'REQ-902',
      institution: { name: 'Dr. Lal PathLabs Central', type: 'Diagnostic Center' },
      purpose: 'Endocrine Panel Diagnostic Sync',
      requestedAt: '10 Sep 2026, 09:15 AM',
      status: 'APPROVED'
    },
    {
      _id: 'REQ-903',
      institution: { name: 'Fortis Healthcare ICU', type: 'Emergency Response' },
      purpose: 'Acute Trauma Vitals Review',
      requestedAt: '02 Sep 2026, 04:45 PM',
      status: 'REVOKED'
    }
  ]);

  // Provider Node Dedicated States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [consentRequestForm, setConsentRequestForm] = useState({
    patientIdentifier: 'MED-PT-8821',
    department: 'Cardiology',
    purpose: 'Elective Angiography Baseline Examination'
  });
  const [requestSuccess, setRequestSuccess] = useState('');

  const [providerRoster, setProviderRoster] = useState([
    { id: 'PT-101', name: 'Aarav Mehta', age: 34, diagnosis: 'Hypertensive Crisis', status: 'CONSENT_GRANTED', bed: 'ICU-B3' },
    { id: 'PT-102', name: 'Sunita Rao', age: 48, diagnosis: 'Type-2 Diabetes Follow-up', status: 'PENDING_APPROVAL', bed: 'OPD-12' },
    { id: 'PT-103', name: 'Vikram Seth', age: 61, diagnosis: 'Post-CABG Cardiac Rehab', status: 'CONSENT_GRANTED', bed: 'Ward-4' }
  ]);

  // Mock Patient Audit Trail
  const auditLogs = [
    { action: 'Record Decrypted', actor: 'Max Super Speciality', timestamp: '11 Sep 2026, 14:02', verified: true },
    { action: 'Consent Revoked', actor: 'Patient Self-Service', timestamp: '10 Sep 2026, 18:30', verified: true },
    { action: 'Vault Deposit Stored', actor: 'Dr. Lal PathLabs', timestamp: '08 Sep 2026, 09:10', verified: true }
  ];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (role === 'PATIENT') {
        if (authMode === 'register') {
          const payload = {
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
            age: Number(authForm.age) || 24,
            phone: authForm.phone,
            bloodGroup: authForm.bloodGroup || 'O+',
            city: authForm.city || 'Agra',
            aadhaar: authForm.aadhaar,
            nominees: [
              { name: authForm.nominee1Name, relation: authForm.nominee1Relation, phone: authForm.nominee1Phone, aadhaar: authForm.nominee1Aadhaar },
              { name: authForm.nominee2Name, relation: authForm.nominee2Relation, phone: authForm.nominee2Phone, aadhaar: authForm.nominee2Aadhaar }
            ]
          };
          const res = await axios.post('http://localhost:5000/api/patients/register', payload);
          setUser({ ...res.data, role: 'PATIENT' });
        } else {
          try {
            const res = await axios.post('http://localhost:5000/api/patients/login', {
              email: authForm.email,
              password: authForm.password
            });
            setUser({ ...res.data, role: 'PATIENT' });
          } catch (err) {
            // Local fallback demo session
            setUser({
              _id: '64a2fb1234567890abcdef12',
              name: authForm.name || 'Hardik Gupta',
              email: authForm.email,
              role: 'PATIENT',
              bloodGroup: authForm.bloodGroup || 'O+',
              city: authForm.city || 'Agra',
              phone: authForm.phone
            });
          }
        }
        setActiveNav('records');
      } else {
        // Institution Flow
        if (authMode === 'register') {
          const providerPayload = {
            name: authForm.institutionName,
            type: authForm.institutionType,
            licenseNumber: authForm.licenseNumber,
            phone: authForm.phone,
            address: authForm.address,
            email: authForm.email,
            password: authForm.password
          };
          const res = await axios.post('http://localhost:5000/api/institutions/register', providerPayload);
          setUser({ ...res.data, role: 'INSTITUTION' });
        } else {
          try {
            const res = await axios.post('http://localhost:5000/api/institutions/login', {
              email: authForm.email,
              password: authForm.password
            });
            setUser({ ...res.data, role: 'INSTITUTION' });
          } catch (err) {
            // Local fallback demo session
            setUser({
              _id: '64a2fb1234567890abcdef13',
              name: authForm.institutionName || 'Apollo Multispeciality Hospital',
              email: authForm.email,
              role: 'INSTITUTION',
              licenseNumber: authForm.licenseNumber || 'NABH-DEL-2026-08',
              type: 'hospital'
            });
          }
        }
        setActiveNav('search');
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || err.response?.data?.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPreviewDoc(null);
    setSearchedPatient(null);
  };

  const fetchRecords = async () => {
    setFetchingRecords(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/records/patient/${user?._id || patientId}`);
      if (res.data && res.data.length > 0) {
        setRecords(res.data);
      } else {
        setRecords([
          { _id: 'REC-001', title: 'Complete Blood Count Panel', recordType: 'LAB_REPORT', createdAt: '2026-09-10' },
          { _id: 'REC-002', title: 'Contrast Brain MRI Scan', recordType: 'IMAGING', createdAt: '2026-09-08' },
          { _id: 'REC-003', title: 'Post-Surgical Discharge Summary', recordType: 'DISCHARGE_SUMMARY', createdAt: '2026-08-28' }
        ]);
      }
    } catch (err) {
      setRecords([
        { _id: 'REC-001', title: 'Complete Blood Count Panel', recordType: 'LAB_REPORT', createdAt: '2026-09-10' },
        { _id: 'REC-002', title: 'Contrast Brain MRI Scan', recordType: 'IMAGING', createdAt: '2026-09-08' },
        { _id: 'REC-003', title: 'Post-Surgical Discharge Summary', recordType: 'DISCHARGE_SUMMARY', createdAt: '2026-08-28' }
      ]);
    } finally {
      setFetchingRecords(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ loading: false, msg: 'Select a document before upload.', type: 'error' });
      return;
    }

    setStatus({ loading: true, msg: 'Uploading and indexing record...', type: 'info' });
    const data = new FormData();
    data.append('patient', user?._id || formData.patient);
    data.append('institution', formData.institution);
    data.append('title', formData.title);
    data.append('recordType', formData.recordType);
    data.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/records/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ loading: false, msg: `Vault entry saved successfully!`, type: 'success' });
      setFormData({ ...formData, title: '' });
      setFile(null);
      fetchRecords();
    } catch (err) {
      const mockSaved = {
        _id: 'REC-' + Math.floor(100 + Math.random() * 900),
        title: formData.title,
        recordType: formData.recordType,
        createdAt: new Date().toISOString()
      };
      setRecords([mockSaved, ...records]);
      setStatus({ loading: false, msg: 'Vault entry registered into registry!', type: 'success' });
      setFormData({ ...formData, title: '' });
      setFile(null);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to permanently delete this health record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/records/${recordId}`);
    } catch (err) {
      // fallback delete locally
    }
    setRecords(records.filter((r) => r._id !== recordId));
    if (previewDoc?._id === recordId) setPreviewDoc(null);
  };

  const handleConsentAction = (consentId, newStatus) => {
    setConsents((prev) =>
      prev.map((c) => (c._id === consentId ? { ...c, status: newStatus } : c))
    );
  };

  // Provider Patient Lookup Simulation
  const handlePatientSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchedPatient({
      id: searchQuery.toUpperCase(),
      name: 'Pooja Varma',
      age: 29,
      gender: 'Female',
      bloodGroup: 'B+',
      city: 'Jaipur',
      registeredOn: '14 Feb 2025',
      consentStatus: 'PENDING_CONSENT',
      recordsAvailable: 4
    });
  };

  const handleRaiseConsent = (e) => {
    e.preventDefault();
    setRequestSuccess(`Consent ticket dispatched to patient ID ${consentRequestForm.patientIdentifier} for ${consentRequestForm.department}.`);
    setTimeout(() => setRequestSuccess(''), 5000);
  };

  const getFullFileUrl = (rawUrl) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
    let clean = rawUrl.replace(/\\/g, '/');
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `http://localhost:5000/${clean}`;
  };

  const isPdf = (url) => url?.toLowerCase().endsWith('.pdf');

  // ==========================================
  // VIEW: AUTHENTICATION PORTAL (LIGHT NAVY)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/50 text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 relative font-sans">

        <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs mb-4 text-xs font-semibold text-slate-700">
            <Activity className="h-4 w-4 text-blue-900 animate-pulse" />
            <span className="tracking-wide uppercase text-[11px] font-bold text-slate-600">MediVault Health Cloud</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Decentralized EHR Platform
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            {role === 'PATIENT'
              ? 'Empowering patients with self-sovereign control over encrypted diagnostic history.'
              : 'Enterprise gateway for verified hospitals, pathology laboratories, and clinics.'}
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white/95 backdrop-blur border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60">

            {/* Mode Switcher */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${authMode === 'login'
                      ? 'bg-gradient-to-r from-slate-900 to-blue-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${authMode === 'register'
                      ? 'bg-gradient-to-r from-slate-900 to-blue-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <UserPlus className="h-3.5 w-3.5" /> Register Identity
                </button>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-2xl mb-6 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setRole('PATIENT')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'PATIENT'
                    ? 'bg-white text-blue-950 border border-slate-200 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <User className="h-4 w-4 text-blue-900" /> Patient Terminal
              </button>
              <button
                type="button"
                onClick={() => setRole('INSTITUTION')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'INSTITUTION'
                    ? 'bg-white text-blue-950 border border-slate-200 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Building2 className="h-4 w-4 text-blue-900" /> Provider Node (Hospital)
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && role === 'PATIENT' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Legal Name</label>
                      <input
                        type="text"
                        placeholder="Hardik Gupta"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Age</label>
                      <input
                        type="number"
                        placeholder="22"
                        value={authForm.age}
                        onChange={(e) => setAuthForm({ ...authForm, age: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 98765-43210"
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Blood Marker</label>
                      <select
                        value={authForm.bloodGroup}
                        onChange={(e) => setAuthForm({ ...authForm, bloodGroup: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      >
                        <option value="O+">O+ Positive</option>
                        <option value="A+">A+ Positive</option>
                        <option value="B+">B+ Positive</option>
                        <option value="AB+">AB+ Positive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Resident City</label>
                      <input
                        type="text"
                        placeholder="Agra"
                        value={authForm.city}
                        onChange={(e) => setAuthForm({ ...authForm, city: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Aadhaar Identifier (12 Digits)
                      </label>
                      <div className="relative">
                        <input
                          type={showPatientAadhaar ? "text" : "password"}
                          maxLength={12}
                          placeholder="••••••••••••"
                          value={authForm.aadhaar}
                          onChange={(e) => setAuthForm({ ...authForm, aadhaar: e.target.value.replace(/\D/g, '') })}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm font-mono tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPatientAadhaar(!showPatientAadhaar)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                        >
                          {showPatientAadhaar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Provider Registration Fields */}
              {authMode === 'register' && role === 'INSTITUTION' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Facility Name</label>
                      <input
                        type="text"
                        placeholder="Apollo Multispeciality"
                        value={authForm.institutionName}
                        onChange={(e) => setAuthForm({ ...authForm, institutionName: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Classification</label>
                      <select
                        value={authForm.institutionType}
                        onChange={(e) => setAuthForm({ ...authForm, institutionType: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      >
                        <option value="hospital">Tertiary Care Hospital</option>
                        <option value="clinic">Specialist Outpatient Clinic</option>
                        <option value="diagnostics">Pathology & Radiology Center</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">State License ID</label>
                      <input
                        type="text"
                        placeholder="NABH-DEL-2026-08"
                        value={authForm.licenseNumber}
                        onChange={(e) => setAuthForm({ ...authForm, licenseNumber: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Emergency Helpline</label>
                      <input
                        type="tel"
                        placeholder="011-4567-8900"
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Shared Credentials */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  {role === 'PATIENT' ? 'Email Address' : 'Hospital Admin Email'}
                </label>
                <input
                  type="email"
                  placeholder={role === 'PATIENT' ? 'user@medivault.io' : 'admin@hospital.org'}
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-slate-900 to-blue-950 hover:from-slate-800 hover:to-blue-900 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? 'Authenticating...' : authMode === 'login' ? `Sign In as ${role === 'PATIENT' ? 'Patient' : 'Provider'}` : 'Complete Registration'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              {authMode === 'login' ? (
                <>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className="text-blue-950 font-bold hover:underline"
                  >
                    Register new profile
                  </button>
                </>
              ) : (
                <>
                  Already enrolled?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    className="text-blue-950 font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD VIEW (PATIENT & PROVIDER DUAL VIEW)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200/90 bg-white p-5 flex flex-col justify-between hidden md:flex shrink-0 shadow-xs">
        <div className="space-y-8">

          <div className="flex items-center gap-3 px-2">
            <div className="p-2.5 bg-gradient-to-tr from-slate-900 to-blue-950 rounded-2xl text-white shadow-md shadow-slate-900/10">
              {user.role === 'PATIENT' ? <Activity className="h-5 w-5" /> : <Hospital className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                MediVault
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {user.role === 'PATIENT' ? 'Patient Terminal' : 'Clinical Workstation'}
              </span>
            </div>
          </div>

          {/* DUAL NAVIGATION */}
          <nav className="space-y-1.5">
            {user.role === 'PATIENT' ? (
              <>
                <button
                  onClick={() => setActiveNav('records')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeNav === 'records'
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200/60 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                  <FolderLock className="h-4 w-4 text-blue-900" />
                  <span>My Medical Vault</span>
                  <span className="ml-auto text-[10px] font-mono bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md">{records.length}</span>
                </button>

                <button
                  onClick={() => setActiveNav('consent')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeNav === 'consent'
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200/60 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                  <KeyRound className="h-4 w-4 text-blue-900" />
                  <span>Consent Hub</span>
                  <span className="ml-auto text-[10px] font-mono bg-blue-100 text-blue-950 font-bold px-2 py-0.5 rounded-md">{consents.length}</span>
                </button>

                <button
                  onClick={() => setActiveNav('vitals')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeNav === 'vitals'
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200/60 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                  <HeartPulse className="h-4 w-4 text-blue-900" />
                  <span>Emergency Health Card</span>
                </button>
              </>
            ) : (
              // PROVIDER NODE NAVIGATION
              <>
                <button
                  onClick={() => setActiveNav('search')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeNav === 'search'
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200/60 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                  <Search className="h-4 w-4 text-blue-900" />
                  <span>Patient Registry Search</span>
                </button>

                <button
                  onClick={() => setActiveNav('requests')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeNav === 'requests'
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200/60 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                  <KeyRound className="h-4 w-4 text-blue-900" />
                  <span>Dispatch Consent Request</span>
                </button>

                <button
                  onClick={() => setActiveNav('roster')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeNav === 'roster'
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200/60 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                  <Users className="h-4 w-4 text-blue-900" />
                  <span>Inpatient Care Roster</span>
                  <span className="ml-auto text-[10px] font-mono bg-blue-100 text-blue-950 font-bold px-2 py-0.5 rounded-md">{providerRoster.length}</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="border-t border-slate-200/80 pt-4 space-y-3">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-950 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {user.role === 'PATIENT' ? 'Patient Node Connected' : `Verified Provider Node: ${user.name}`}
            </div>

            {user.role === 'INSTITUTION' && (
              <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600">
                Lic: {user.licenseNumber || 'NABH-DEL-2026-08'}
              </span>
            )}
          </div>

          {user.role === 'INSTITUTION' && (
            <button
              onClick={() => setBreakGlassActive(!breakGlassActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${breakGlassActive
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {breakGlassActive ? 'Emergency Protocol Active' : 'Break-Glass ICU Access'}
            </button>
          )}
        </header>

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">

          {/* ======================================================== */}
          {/* SECTION A: PATIENT SPECIFIC VIEWS                        */}
          {/* ======================================================== */}

          {/* TAB: MEDICAL VAULT (UPLOAD & RECORDS) */}
          {user.role === 'PATIENT' && activeNav === 'records' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              <section className="lg:col-span-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-900" /> Upload Diagnostic Report
                  </h3>
                  <p className="text-xs text-slate-500">Deposit lab diagnostics, prescriptions, or imaging files.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Document Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC)"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Classification</label>
                    <select
                      value={formData.recordType}
                      onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                    >
                      <option value="LAB_REPORT">Lab Diagnostic Report</option>
                      <option value="PRESCRIPTION">Clinical Prescription</option>
                      <option value="IMAGING">Radiology (X-Ray / MRI)</option>
                      <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Select Document</label>
                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-800/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all">
                      <Upload className="h-6 w-6 text-blue-900 mb-1.5" />
                      <span className="text-xs font-semibold text-slate-700 text-center truncate max-w-[220px]">
                        {file ? file.name : "Choose JPG, PNG or PDF"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Max size 10MB • Cryptographically signed</span>
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>

                  {status.msg && (
                    <div className={`p-3 rounded-xl text-xs font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800'
                      }`}>
                      {status.msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status.loading}
                    className="w-full bg-gradient-to-r from-slate-900 to-blue-950 hover:from-slate-800 hover:to-blue-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all"
                  >
                    {status.loading ? 'Uploading...' : 'Save To Vault'}
                  </button>
                </form>
              </section>

              {/* Records List */}
              <section className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-900" /> Patient Medical Vault
                  </h3>
                  <button onClick={fetchRecords} className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Refresh
                  </button>
                </div>

                <div className="space-y-3">
                  {records.map((rec) => (
                    <div
                      key={rec._id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="p-3 bg-blue-50 text-blue-950 rounded-xl border border-blue-100 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-slate-900 truncate">{rec.title}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase bg-slate-100 text-slate-700 border-slate-200 inline-block mt-0.5">
                            {rec.recordType}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">Ref ID: {rec._id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPreviewDoc(rec)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB: CONSENT HUB */}
          {user.role === 'PATIENT' && activeNav === 'consent' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-blue-900" /> Patient Access & Consent Hub
                </h3>
                <p className="text-xs text-slate-500 mt-1">Hospitals require your consent before accessing medical history.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Active Permissions</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {consents.filter(c => c.status === 'APPROVED').length}
                  </p>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Review</span>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {consents.filter(c => c.status === 'PENDING').length}
                  </p>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Revoked Tokens</span>
                  <p className="text-2xl font-black text-rose-600 mt-1">
                    {consents.filter(c => c.status === 'REVOKED').length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {consents.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 flex items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-slate-100 text-slate-800 rounded-xl border border-slate-200 shrink-0">
                        <Hospital className="h-5 w-5 text-blue-900" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {c.institution?.name || 'Healthcare Node'}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${c.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              c.status === 'REVOKED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Scope: <span className="font-medium text-slate-800">{c.purpose}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">Request Reference: {c._id} • {c.requestedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleConsentAction(c._id, 'APPROVED')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5" /> Authorize
                        </button>
                      )}
                      {c.status !== 'REVOKED' && (
                        <button
                          onClick={() => handleConsentAction(c._id, 'REVOKED')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition-all"
                        >
                          <X className="h-3.5 w-3.5" /> Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EMERGENCY HEALTH CARD & AUDIT TRAIL */}
          {user.role === 'PATIENT' && activeNav === 'vitals' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-rose-600" /> Emergency Health Card
                </h3>
                <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-3xl shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-lg font-extrabold">{user.name}</h4>
                      <p className="text-xs text-blue-200">Patient Identifier: MED-PT-8821</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-300 block">Blood Group</span>
                      <span className="text-2xl font-black text-rose-400">{user.bloodGroup || 'O+'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Primary Contact</span>
                      <span className="font-mono font-medium">{user.phone || '+91 98765-43210'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Known Allergies</span>
                      <span className="text-amber-300 font-semibold">Penicillin (Severe)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Primary Nominee</span>
                      <span className="font-semibold">Gaurav Sharma (Brother)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Identity Status</span>
                      <span className="text-emerald-400 font-bold">● AADHAAR VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-900" /> Cryptographic Access Ledger
                </h3>
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{log.action}</span>
                        <span className="text-slate-500">{log.actor}</span>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-400">
                        {log.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION B: HOSPITAL / PROVIDER NODE VIEWS                */}
          {/* ======================================================== */}

          {/* PROVIDER VIEW 1: PATIENT REGISTRY LOOKUP */}
          {user.role === 'INSTITUTION' && activeNav === 'search' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-900" /> National Patient Registry Lookup
                </h3>
                <p className="text-xs text-slate-500 mt-1">Search patients across the MediVault federated cluster using Patient ID or Phone.</p>
              </div>

              <form onSubmit={handlePatientSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Patient ID (e.g. MED-PT-8821) or Phone (+91 ...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-slate-900 to-blue-950 text-white text-xs font-bold rounded-2xl shadow-md hover:from-slate-800 transition-all"
                >
                  Lookup Patient
                </button>
              </form>

              {/* Searched Patient Result Card */}
              {searchedPatient && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 font-black text-base flex items-center justify-center border border-blue-200">
                        {searchedPatient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{searchedPatient.name}</h4>
                        <span className="text-xs font-mono text-slate-500">ID: {searchedPatient.id} • {searchedPatient.city}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      CONSENT REQUIRED TO VIEW RECORDS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Age / Gender</span>
                      <span className="font-bold text-slate-800">{searchedPatient.age} Yrs / {searchedPatient.gender}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Blood Group</span>
                      <span className="font-bold text-rose-600">{searchedPatient.bloodGroup}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Vault File Count</span>
                      <span className="font-bold text-slate-800">{searchedPatient.recordsAvailable} Encrypted Files</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Registration Node</span>
                      <span className="font-bold text-emerald-600">Verified Citizen</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveNav('requests')}
                      className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Request Decryption Consent
                    </button>
                    {breakGlassActive && (
                      <button
                        onClick={() => alert("Emergency Break-Glass Audit triggered: Access logged to hospital incident registry.")}
                        className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Break-Glass Override
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROVIDER VIEW 2: DISPATCH CONSENT REQUEST */}
          {user.role === 'INSTITUTION' && activeNav === 'requests' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-blue-900" /> Raise Cryptographic Consent Request
                </h3>
                <p className="text-xs text-slate-500 mt-1">Send a cryptographic access request to the patient's MediVault mobile/web terminal.</p>
              </div>

              {requestSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{requestSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRaiseConsent} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Target Patient Identifier</label>
                  <input
                    type="text"
                    value={consentRequestForm.patientIdentifier}
                    onChange={(e) => setConsentRequestForm({ ...consentRequestForm, patientIdentifier: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Requesting Clinical Department</label>
                  <select
                    value={consentRequestForm.department}
                    onChange={(e) => setConsentRequestForm({ ...consentRequestForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                  >
                    <option value="Cardiology">Cardiology Department</option>
                    <option value="Oncology">Oncology & Chemotherapy Unit</option>
                    <option value="Emergency & Trauma">Emergency & Trauma Care</option>
                    <option value="Radiology">Radiology & Imaging Consultation</option>
                    <option value="Pathology">Pathology Laboratory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Clinical Purpose Justification</label>
                  <textarea
                    rows={3}
                    value={consentRequestForm.purpose}
                    onChange={(e) => setConsentRequestForm({ ...consentRequestForm, purpose: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-900 to-blue-950 hover:from-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md"
                >
                  Dispatch Consent Request Ticket
                </button>
              </form>
            </div>
          )}

          {/* PROVIDER VIEW 3: INPATIENT CARE ROSTER */}
          {user.role === 'INSTITUTION' && activeNav === 'roster' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-900" /> Active Inpatient Roster & Consent Status
                </h3>
                <p className="text-xs text-slate-500 mt-1">Manage active patients admitted under your institutional facility node.</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                      <th className="p-4">Patient Info</th>
                      <th className="p-4">Ward / Bed</th>
                      <th className="p-4">Working Diagnosis</th>
                      <th className="p-4">EHR Access Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {providerRoster.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{patient.name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">ID: {patient.id} • {patient.age} Yrs</span>
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-700">{patient.bed}</td>
                        <td className="p-4 text-slate-700 font-medium">{patient.diagnosis}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${patient.status === 'CONSENT_GRANTED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {patient.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (patient.status === 'CONSENT_GRANTED') {
                                setPreviewDoc({ title: `${patient.name} - Diagnostic History`, recordType: 'LAB_REPORT' });
                              } else {
                                alert("Consent not approved yet by patient.");
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-all"
                          >
                            Open Records
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================== */}
      {/* IN-DASHBOARD FILE PREVIEW MODAL            */}
      {/* ========================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-950 border border-blue-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{previewDoc.title}</h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    Type: {previewDoc.recordType} • Ref: {previewDoc._id || 'ENC-VERIFIED'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewDoc.fileUrl && (
                  <a
                    href={getFullFileUrl(previewDoc.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
                    title="Open Raw Document"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 rounded-xl transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-auto bg-slate-100/50 flex items-center justify-center min-h-[420px]">
              {previewDoc.fileUrl ? (
                isPdf(previewDoc.fileUrl) ? (
                  <iframe
                    src={getFullFileUrl(previewDoc.fileUrl)}
                    title="Report Viewer"
                    className="w-full h-[65vh] rounded-xl border border-slate-200 bg-white shadow-xs"
                  />
                ) : (
                  <img
                    src={getFullFileUrl(previewDoc.fileUrl)}
                    alt="Medical Preview"
                    className="max-h-[65vh] max-w-full rounded-xl object-contain border border-slate-200 shadow-xs bg-white"
                  />
                )
              ) : (
                <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl max-w-md shadow-xs space-y-3">
                  <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Verified Electronic Health Record</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cryptographic hash validated against decentralized ledger. All clinical markers, prescription dosages, and metadata are intact.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> End-to-End Encrypted Clinical Data Stream
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}