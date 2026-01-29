

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { User } = require('../models');


router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password_hash')
      .sort({ createdAt: -1 });

    res.json({
      users: users.map(u => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        created_at: u.createdAt,
      })),
      count: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});


router.patch('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;


    const validRoles = ['admin', 'buyer', 'problem_solver'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles 
      });
    }

 
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Role updated successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Server error while updating role' });
  }
});


router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        profile_info: user.profile_info,
        created_at: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
