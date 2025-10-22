const express = require('express');
require('dotenv').config();

const cors = require('cors');
const connectDB = require('./config/db');
const studentRoute = require('./routes/studentRoute');
const companiesRoute = require('./routes/companiesRoutes');


const app = express();
const PORT = process.env.PORT  ;

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test Route
app.get('/', (req, res) => {
  res.send('I Camp Server');
});

// Main API Route
app.use('/api/v1/student', studentRoute);
app.use('/api/v2/companies', companiesRoute);


// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
