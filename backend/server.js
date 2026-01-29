/**
 * Project Marketplace Backend Server
 * Main Express application entry point with MongoDB
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const requestRoutes = require('./routes/requests');
const taskRoutes = require('./routes/tasks');
const submissionRoutes = require('./routes/submissions');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for authorized users only in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Project Marketplace API is running with MongoDB',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size too large (max 50MB)' });
  }
  
  if (err.message === 'Only ZIP files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║   🚀 Project Marketplace API Server Running   ║
  ╠════════════════════════════════════════════════╣
  ║   Port: ${PORT}                                   ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                   ║
  ║   Database: MongoDB                            ║
  ║   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}      ║
  ╚════════════════════════════════════════════════╝
  `);
  console.log('📡 API endpoints:');
  console.log('   - POST   /api/auth/register');
  console.log('   - POST   /api/auth/login');
  console.log('   - GET    /api/users (admin)');
  console.log('   - PATCH  /api/users/:id/role (admin)');
  console.log('   - POST   /api/projects (buyer)');
  console.log('   - GET    /api/projects');
  console.log('   - POST   /api/requests (solver)');
  console.log('   - PATCH  /api/requests/:id/accept (buyer)');
  console.log('   - POST   /api/tasks (solver)');
  console.log('   - POST   /api/submissions (solver)');
  console.log('   - PATCH  /api/submissions/:id/accept (buyer)');
  console.log('\n✅ Ready for connections!\n');
});
