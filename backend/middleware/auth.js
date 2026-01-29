/**
 * Authentication Middleware
 * Handles JWT token verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password_hash');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Convenience middleware for specific roles
 */
const requireAdmin = requireRole(['admin']);
const requireBuyer = requireRole(['buyer']);
const requireSolver = requireRole(['problem_solver']);
const requireBuyerOrAdmin = requireRole(['buyer', 'admin']);

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireBuyer,
  requireSolver,
  requireBuyerOrAdmin,
};
