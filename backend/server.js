

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const requestRoutes = require('./routes/requests');
const taskRoutes = require('./routes/tasks');
const submissionRoutes = require('./routes/submissions');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);


app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Project Marketplace API is running with MongoDB',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});


app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  

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

app.listen(PORT, () => {
  console.log(`
 
      Port: ${PORT}
      Environment: ${process.env.NODE_ENV || 'development'}
      Database: MongoDB                            
      Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}      
  
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
