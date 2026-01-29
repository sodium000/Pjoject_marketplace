
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireBuyer } = require('../middleware/auth');
const { Project, User } = require('../models');


router.post('/', authenticate, requireBuyer, [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const project = await Project.create({
      buyer_id: req.user.id,
      title,
      description,
      status: 'open',
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project._id.toString(),
        buyer_id: project.buyer_id.toString(),
        title: project.title,
        description: project.description,
        status: project.status,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error while creating project' });
  }
});


router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'buyer') {
      query.buyer_id = req.user.id;
    } else if (req.user.role === 'problem_solver') {
      query.$or = [
        { status: 'open' },
        { assigned_solver_id: req.user.id }
      ];
    }


    const projects = await Project.find(query)
      .populate('buyer_id', 'name email')
      .populate('assigned_solver_id', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      projects: projects.map(p => ({
        id: p._id.toString(),
        buyer_id: p.buyer_id._id.toString(),
        buyer_name: p.buyer_id.name,
        title: p.title,
        description: p.description,
        status: p.status,
        assigned_solver_id: p.assigned_solver_id?._id.toString() || null,
        solver_name: p.assigned_solver_id?.name || null,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      })),
      count: projects.length
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
});


router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('buyer_id', 'name email')
      .populate('assigned_solver_id', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }


    if (req.user.role === 'buyer' && project.buyer_id._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'problem_solver' && 
        project.status !== 'open' && 
        project.assigned_solver_id?._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      project: {
        id: project._id.toString(),
        buyer_id: project.buyer_id._id.toString(),
        buyer_name: project.buyer_id.name,
        buyer_email: project.buyer_id.email,
        title: project.title,
        description: project.description,
        status: project.status,
        assigned_solver_id: project.assigned_solver_id?._id.toString() || null,
        solver_name: project.assigned_solver_id?.name || null,
        solver_email: project.assigned_solver_id?.email || null,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error while fetching project' });
  }
});


router.patch('/:id', authenticate, requireBuyer, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const { id } = req.params;


    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.buyer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }


    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) {
      const validStatuses = ['open', 'assigned', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    res.json({
      message: 'Project updated successfully',
      project: {
        id: updatedProject._id.toString(),
        title: updatedProject.title,
        description: updatedProject.description,
        status: updatedProject.status,
        updated_at: updatedProject.updatedAt,
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error while updating project' });
  }
});


router.delete('/:id', authenticate, requireBuyer, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOneAndDelete({
      _id: id,
      buyer_id: req.user.id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error while deleting project' });
  }
});

module.exports = router;
