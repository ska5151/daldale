const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3301;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Backend API is running');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api', require('./routes/settingsRoutes')); // Settings routes are mixed (categories, user, etc.)

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
