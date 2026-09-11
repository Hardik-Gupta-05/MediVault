const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
