const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars from explicit path relative to this file
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
// app.use(cors());
app.use(cors({
  origin: [
    'https://stock-market-jade.vercel.app',   // your deployed Vercel URL
    'http://localhost:5173'               // for local dev/testing
  ],
  credentials: true
}));


// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Serve the Vite build and fall back to index.html for client-side routes.
// __dirname keeps this working whether the server is started from the project
// root or from the backend folder.
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => res.sendFile(path.join(frontendDistPath, 'index.html')));
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
