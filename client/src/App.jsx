import React, { useState, useEffect } from 'react';
import {
  Upload, Activity, ShieldCheck, CheckCircle2,
  FileText, Calendar, ExternalLink, RefreshCw,
  AlertCircle, KeyRound, Check, X, Clock,
  Lock, Mail, User, Building2, ArrowRight, Eye, EyeOff, LogOut,
  Phone, MapPin, Droplet, CreditCard, Stethoscope, Users,
  FolderLock, Compass, Bell, ChevronRight, Sparkles, Database
} from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('register');
  const [role, setRole] = useState('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [authForm, setAuthForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    bloodGroup: '',
    city: '',
    aadhaar: '',
    nominee1Name: '',
    nominee1Relation: '',
    nominee1Phone: '',
    nominee1Aadhaar: '',
    nominee2Name: '',
    nominee2Relation: '',
    nominee2Phone: '',
    nominee2Aadhaar: '',
    institutionName: '',
    institutionType: '',
    licenseNumber: '',
    address: ''
  });
  const [authError, setAuthError] = useState('');

  // Dashboard Context IDs
  const patientId = '64a2fb1234567890abcdef12';
  const institutionId = '64a2fb1234567890abcdef13';
  const [activeNav, setActiveNav] = useState('records'); // 'records' | 'consent' | 'analytics'
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
  const [consents, setConsents] = useState([]);
  const [fetchingConsents, setFetchingConsents] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
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
          {
            name: authForm.nominee1Name,
            relation: authForm.nominee1Relation,
            phone: authForm.nominee1Phone,
            aadhaar: authForm.nominee1Aadhaar
          },
          {
            name: authForm.nominee2Name,
            relation: authForm.nominee2Relation,
            phone: authForm.nominee2Phone,
            aadhaar: authForm.nominee2Aadhaar
          }
        ]
      };

      const res = await axios.post('http://localhost:5000/api/patients/register', payload);
      alert('Data Saved to MongoDB Atlas successfully! ID: ' + res.data._id);
      setUser(res.data);
    } catch (err) {
      alert('Error saving to DB: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthForm({
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      name: '',
      age: '',
      bloodGroup: '',
      city: '',
      aadhaar: '',
      nominee1Name: '',
      nominee1Relation: '',
      nominee1Phone: '',
      nominee1Aadhaar: '',
      nominee2Name: '',
      nominee2Relation: '',
      nominee2Phone: '',
      nominee2Aadhaar: '',
      institutionName: '',
      institutionType: '',
      licenseNumber: '',
      address: ''
    });
  };

  const fetchRecords = async () => {
    setFetchingRecords(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/records/patient/${patientId}`);
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setFetchingRecords(false);
    }
  };

  const fetchConsents = async () => {
    setFetchingConsents(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/consent/patient/${patientId}`);
      setConsents(res.data);
    } catch (err) {
      console.error("Error fetching consents:", err);
    } finally {
      setFetchingConsents(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
      fetchConsents();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ loading: false, msg: 'Select a cryptographic document before upload.', type: 'error' });
      return;
    }

    setStatus({ loading: true, msg: 'Sharding and uploading record to vault...', type: 'info' });
    const data = new FormData();
    data.append('patient', formData.patient);
    data.append('institution', formData.institution);
    data.append('title', formData.title);
    data.append('recordType', formData.recordType);
    data.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/records/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ loading: false, msg: `Vault entry saved! Reference: ${res.data._id}`, type: 'success' });
      setFormData({ ...formData, title: '' });
      setFile(null);
      fetchRecords();
    } catch (err) {
      setStatus({
        loading: false,
        msg: err.response?.data?.message || 'Error transmitting health record',
        type: 'error',
      });
    }
  };

  const handleConsentAction = async (consentId, newStatus) => {
    setActionLoading(consentId);
    try {
      await axios.patch(`http://localhost:5000/api/consent/${consentId}/status`, {
        status: newStatus
      });
      fetchConsents();
    } catch (err) {
      console.error("Failed to transition consent state:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // --- VIEW 1: AUTHENTICATION PORTAL ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-200 flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
        {/* Glow Spheres */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center relative z-10 mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 shadow-xl mb-4 backdrop-blur-md">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-cyan-300 uppercase">Quantum Vault Protocol</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-teal-200">
            MediVault Unified Health Cloud
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            {authMode === 'register'
              ? 'Decentralized patient and provider health record orchestration with cryptographic consent.'
              : 'Authorize your digital identity key to view encrypted EHR pipelines.'}
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
          <div className="bg-[#0e1626]/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-950/20">

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-[#080d1a] p-1.5 rounded-2xl mb-8 border border-slate-800/90">
              <button
                type="button"
                onClick={() => setRole('PATIENT')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${role === 'PATIENT'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <User className="h-4 w-4" /> Patient Terminal
              </button>
              <button
                type="button"
                onClick={() => setRole('INSTITUTION')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${role === 'INSTITUTION'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Building2 className="h-4 w-4" /> Provider Node
              </button>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-medium flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">

              {/* PATIENT FORM */}
              {authMode === 'register' && role === 'PATIENT' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Legal Identity Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <input
                          type="text"
                          placeholder="Rahul Sharma"
                          value={authForm.name}
                          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
                      <input
                        type="number"
                        placeholder="24"
                        min="1"
                        max="120"
                        value={authForm.age}
                        onChange={(e) => setAuthForm({ ...authForm, age: e.target.value })}
                        required
                        className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Contact</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <input
                          type="tel"
                          placeholder="+91 98765-43210"
                          value={authForm.phone}
                          onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group Marker</label>
                      <div className="relative">
                        <Droplet className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <select
                          value={authForm.bloodGroup}
                          onChange={(e) => setAuthForm({ ...authForm, bloodGroup: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        >
                          <option value="" className="bg-slate-900">Select Marker</option>
                          <option value="A+" className="bg-slate-900">A+ Positive</option>
                          <option value="A-" className="bg-slate-900">A- Negative</option>
                          <option value="B+" className="bg-slate-900">B+ Positive</option>
                          <option value="B-" className="bg-slate-900">B- Negative</option>
                          <option value="O+" className="bg-slate-900">O+ Positive</option>
                          <option value="O-" className="bg-slate-900">O- Negative</option>
                          <option value="AB+" className="bg-slate-900">AB+ Positive</option>
                          <option value="AB-" className="bg-slate-900">AB- Negative</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resident City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <input
                          type="text"
                          placeholder="Jaipur / Agra"
                          value={authForm.city}
                          onChange={(e) => setAuthForm({ ...authForm, city: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aadhaar Identifier (12 Digits)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <input
                          type="password"
                          maxLength={12}
                          placeholder="••••••••••••"
                          value={authForm.aadhaar}
                          onChange={(e) => setAuthForm({ ...authForm, aadhaar: e.target.value.replace(/\D/g, '') })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nominees Grid */}
                  <div className="bg-[#09101f] border border-slate-800/90 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                      <Users className="h-4 w-4" /> Emergency Nominee Pair (Statutory)
                    </div>

                    {/* Nominee 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <input
                        type="text"
                        placeholder="Nominee 1: Full Name"
                        value={authForm.nominee1Name}
                        onChange={(e) => setAuthForm({ ...authForm, nominee1Name: e.target.value })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Relation (e.g. Spouse / Mother)"
                        value={authForm.nominee1Relation}
                        onChange={(e) => setAuthForm({ ...authForm, nominee1Relation: e.target.value })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="tel"
                        placeholder="Nominee 1 Contact"
                        value={authForm.nominee1Phone}
                        onChange={(e) => setAuthForm({ ...authForm, nominee1Phone: e.target.value })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="password"
                        maxLength={12}
                        placeholder="Nominee 1 Aadhaar (12 Digits)"
                        value={authForm.nominee1Aadhaar}
                        onChange={(e) => setAuthForm({ ...authForm, nominee1Aadhaar: e.target.value.replace(/\D/g, '') })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Nominee 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      <input
                        type="text"
                        placeholder="Nominee 2: Full Name"
                        value={authForm.nominee2Name}
                        onChange={(e) => setAuthForm({ ...authForm, nominee2Name: e.target.value })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Relation (e.g. Sibling / Father)"
                        value={authForm.nominee2Relation}
                        onChange={(e) => setAuthForm({ ...authForm, nominee2Relation: e.target.value })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="tel"
                        placeholder="Nominee 2 Contact"
                        value={authForm.nominee2Phone}
                        onChange={(e) => setAuthForm({ ...authForm, nominee2Phone: e.target.value })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="password"
                        maxLength={12}
                        placeholder="Nominee 2 Aadhaar (12 Digits)"
                        value={authForm.nominee2Aadhaar}
                        onChange={(e) => setAuthForm({ ...authForm, nominee2Aadhaar: e.target.value.replace(/\D/g, '') })}
                        required
                        className="bg-[#060a14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* HOSPITAL FORM */}
              {authMode === 'register' && role === 'INSTITUTION' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hospital / Healthcare Unit</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <input
                          type="text"
                          placeholder="Apollo Multispeciality"
                          value={authForm.institutionName}
                          onChange={(e) => setAuthForm({ ...authForm, institutionName: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Classification</label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <select
                          value={authForm.institutionType}
                          onChange={(e) => setAuthForm({ ...authForm, institutionType: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        >
                          <option value="" className="bg-slate-900">Select Facility Type</option>
                          <option value="hospital" className="bg-slate-900">Tertiary Hospital</option>
                          <option value="clinic" className="bg-slate-900">Specialist Clinic</option>
                          <option value="diagnostics" className="bg-slate-900">Pathology & Radiology Center</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">State License Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <input
                          type="text"
                          placeholder="MED-REG-2026-99"
                          value={authForm.licenseNumber}
                          onChange={(e) => setAuthForm({ ...authForm, licenseNumber: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Official Helpdesk Line</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                        <input
                          type="tel"
                          placeholder="011-4567-8900"
                          value={authForm.phone}
                          onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                          required
                          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Physical Clinical Facility Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                      <input
                        type="text"
                        placeholder="Sector 14, Main Arterial Road, Agra"
                        value={authForm.address}
                        onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })}
                        required
                        className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Shared Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Transmission Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                  <input
                    type="email"
                    placeholder="user@medivault.network"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                    className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Private Encryption Key</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      required
                      className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'register' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Re-type Key Confirmation</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-500/70" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                        required
                        className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
              >
                <span>{authMode === 'register' ? 'Register Immutable Vault Identity' : 'Authenticate Digital Session'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors"
              >
                {authMode === 'login'
                  ? "Require onboarding? Initialize registration pipeline"
                  : 'Already registered in the cluster? Access your vault'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="h-4 w-4 text-cyan-500" />
            <span>AES-256 GCM Cloud Storage • Consent Contract Compliant</span>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: SLEEK POST-LOGIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 flex font-sans selection:bg-cyan-500 selection:text-slate-950">

      {/* Sleek Floating Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0a0f1d]/95 p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shadow-inner">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-cyan-300">
                MediVault
              </span>
              <span className="block text-[10px] text-slate-500 font-medium uppercase tracking-widest">EHR Protocol</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveNav('records')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeNav === 'records'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
            >
              <FolderLock className="h-4 w-4 text-cyan-400" />
              <span>Medical Vault</span>
              <span className="ml-auto text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">{records.length}</span>
            </button>

            <button
              onClick={() => setActiveNav('consent')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeNav === 'consent'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
            >
              <KeyRound className="h-4 w-4 text-teal-400" />
              <span>Consent Hub</span>
              {consents.filter(c => c.status === 'PENDING').length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  {consents.filter(c => c.status === 'PENDING').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveNav('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeNav === 'analytics'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
            >
              <Compass className="h-4 w-4 text-slate-400" />
              <span>Security Audit</span>
            </button>
          </nav>
        </div>

        {/* Identity Tile & Logout */}
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          <div className="bg-[#0e1627] border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-200 truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Floating Glass Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              NODE CONNECTED
            </div>
            <span className="text-xs text-slate-500">Cluster 221 • Atlas DB</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Identity Verified ({user.role})</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic Body */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">

          {/* Patient Overview Matrix Bar */}
          <div className="bg-gradient-to-r from-[#0c1527] via-[#0e182e] to-[#0a1222] border border-slate-800/90 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-80 h-full bg-cyan-500/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Active Vault Dashboard</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-100">{user.name}</h2>
                <p className="text-xs text-slate-400">
                  Patient Vault Index: <span className="font-mono text-slate-300">{patientId}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Blood Marker</span>
                  <span className="text-lg font-black text-rose-400">{user.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Vault Records</span>
                  <span className="text-lg font-black text-cyan-300">{records.length} files</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Grants</span>
                  <span className="text-lg font-black text-emerald-400">
                    {consents.filter(c => c.status === 'APPROVED').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: MEDICAL RECORDS ENGINE */}
          {activeNav === 'records' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Record Deposit Box */}
              <section className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-cyan-400" />
                    Deposit Encrypted Record
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Files are hashed and anchored with metadata to MongoDB Atlas.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#0e1626]/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Record Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. Brain MRI / Lipid Profile"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payload Category</label>
                    <select
                      value={formData.recordType}
                      onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                      className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="LAB_REPORT" className="bg-slate-900">Lab Diagnostic Report</option>
                      <option value="PRESCRIPTION" className="bg-slate-900">Clinical Prescription</option>
                      <option value="IMAGING" className="bg-slate-900">Medical Imaging (X-Ray / MRI)</option>
                      <option value="DISCHARGE_SUMMARY" className="bg-slate-900">Discharge Summary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Document Binary</label>
                    <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#080d1a]/50 transition-all">
                      <Upload className="h-7 w-7 text-cyan-400 mb-2" />
                      <span className="text-xs font-medium text-slate-300 text-center truncate max-w-[220px]">
                        {file ? file.name : "Select medical report payload"}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">PDF or Imaging files up to 10MB</span>
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                    </label>
                  </div>

                  {status.msg && (
                    <div className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                      status.type === 'error' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                        'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}>
                      {status.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />}
                      {status.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />}
                      <span>{status.msg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status.loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status.loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Execute Vault Deposit'}
                  </button>
                </form>
              </section>

              {/* Record Feed Stream */}
              <section className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Database className="h-5 w-5 text-teal-400" />
                      Immutable Record Vault
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Patient records mapped in MongoDB Atlas cloud collection.</p>
                  </div>
                  <button
                    onClick={fetchRecords}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <RefreshCw className={`h-3 w-3 ${fetchingRecords ? 'animate-spin' : ''}`} /> Sync
                  </button>
                </div>

                <div className="space-y-3">
                  {records.length === 0 ? (
                    <div className="bg-[#0e1626]/80 rounded-3xl border border-slate-800 p-12 text-center">
                      <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-300">Vault Cache Empty</h4>
                      <p className="text-xs text-slate-500 mt-1">Deposit your first diagnostic file from the deposit module.</p>
                    </div>
                  ) : (
                    records.map((rec) => (
                      <div
                        key={rec._id}
                        className="bg-[#0e1626]/80 rounded-2xl border border-slate-800/90 p-4 shadow-lg hover:border-cyan-500/40 transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-slate-200 truncate">{rec.title}</h5>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                                {rec.recordType}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(rec.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">ID: {rec._id}</p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 shrink-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {rec.fileUrl ? rec.fileUrl.slice(-10) : 'File Payload'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: CONSENT CONTROL DECK */}
          {activeNav === 'consent' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-cyan-400" />
                    Consent Authorization Protocol
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Review active institutional contracts and revoke permissions in real time.</p>
                </div>
                <button
                  onClick={fetchConsents}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
                >
                  <RefreshCw className={`h-3 w-3 ${fetchingConsents ? 'animate-spin' : ''}`} /> Sync Consents
                </button>
              </div>

              <div className="space-y-3.5">
                {consents.length === 0 ? (
                  <div className="bg-[#0e1626]/80 rounded-3xl border border-slate-800 p-12 text-center">
                    <KeyRound className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-300">No Access Requests Registered</h4>
                    <p className="text-xs text-slate-500 mt-1">Incoming clinical hospital inquiries will populate this cryptographic ledger.</p>
                  </div>
                ) : (
                  consents.map((consent) => (
                    <div
                      key={consent._id}
                      className="bg-[#0e1626]/80 rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${consent.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                            consent.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                              consent.status === 'REVOKED' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}>
                            {consent.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Requester: {consent.institution.slice(0, 12)}...
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">{consent.purpose}</h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Expires: {new Date(consent.expiresAt).toLocaleDateString()}
                          </span>
                          <span>Record ID: {consent._id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {consent.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleConsentAction(consent._id, 'APPROVED')}
                              disabled={actionLoading === consent._id}
                              className="flex items-center gap-1 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all"
                            >
                              <Check className="h-3.5 w-3.5" /> Authorize
                            </button>
                            <button
                              onClick={() => handleConsentAction(consent._id, 'REJECTED')}
                              disabled={actionLoading === consent._id}
                              className="flex items-center gap-1 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all"
                            >
                              <X className="h-3.5 w-3.5" /> Decline
                            </button>
                          </>
                        )}

                        {consent.status === 'APPROVED' && (
                          <button
                            onClick={() => handleConsentAction(consent._id, 'REVOKED')}
                            disabled={actionLoading === consent._id}
                            className="px-3.5 py-2 bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
                          >
                            Revoke Permission
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* TAB 3: AUDIT PROTOCOL */}
          {activeNav === 'analytics' && (
            <div className="bg-[#0e1626]/80 rounded-3xl border border-slate-800 p-8 space-y-4">
              <div className="flex items-center gap-3 text-cyan-400">
                <Sparkles className="h-6 w-6" />
                <h3 className="text-lg font-bold text-slate-100">HIPAA Security Audit Ledger</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                MediVault maintains a distributed cryptographic log of all state modifications. Every time a hospital queries patient records or alters consent status, an immutable signature is registered to prevent unauthorized medical surveillance.
              </p>
              <div className="bg-[#080d1a] border border-slate-800/80 rounded-2xl p-4 font-mono text-xs text-slate-400 space-y-2">
                <p className="text-emerald-400">✓ GridFS Multi-part storage operational</p>
                <p className="text-cyan-400">✓ Aadhaar & Nominee data pipeline bound to memory models</p>
                <p className="text-teal-400">✓ Active session keyed to {user.role} context</p>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}