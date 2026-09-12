const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads for modal preview
app.use('/uploads', express.static(uploadsDir));

// Database Connection
connectDB();

// Basic Route
app.get('/', (req, res) => {
  res.send('Medical Project API is running...');
});

// Mount Routes
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/consent', require('./routes/consentRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes')); // <-- Mounted before listen

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});