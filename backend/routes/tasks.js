
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { Task, Project } = require('../models');


router.post('/', authenticate, [
  body('projectId').notEmpty(),
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('deadline').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, title, description, deadline } = req.body;


    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.assigned_solver_id?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this project' });
    }

    if (project.status !== 'assigned') {
      return res.status(400).json({ error: 'Project is not in assigned status' });
    }

    const task = await Task.create({
      project_id: projectId,
      title,
      description: description || '',
      deadline: deadline || null,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task._id.toString(),
        project_id: task.project_id.toString(),
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        status: task.status,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error while creating task' });
  }
});


router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;


    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const hasAccess = project.buyer_id.toString() === req.user.id || 
                      project.assigned_solver_id?.toString() === req.user.id ||
                      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }


    const tasks = await Task.find({ project_id: projectId })
      .sort({ createdAt: 1 });

    res.json({
      tasks: tasks.map(t => ({
        id: t._id.toString(),
        project_id: t.project_id.toString(),
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        status: t.status,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      })),
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error while fetching tasks' });
  }
});


router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;
    const { id } = req.params;


    const task = await Task.findById(id).populate('project_id');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.project_id.assigned_solver_id?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (deadline) updates.deadline = deadline;
    if (status) {
      const validStatuses = ['pending', 'in_progress', 'submitted', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status', validStatuses });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    res.json({
      message: 'Task updated successfully',
      task: {
        id: updatedTask._id.toString(),
        title: updatedTask.title,
        description: updatedTask.description,
        deadline: updatedTask.deadline,
        status: updatedTask.status,
        updated_at: updatedTask.updatedAt,
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error while updating task' });
  }
});

module.exports = router;
