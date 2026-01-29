
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireBuyer } = require('../middleware/auth');
const upload = require('../config/upload');
const { Submission, Task, Project } = require('../models');


router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { taskId, notes } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }


    const task = await Task.findById(taskId).populate('project_id');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.project_id.assigned_solver_id?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this task' });
    }


    const submission = await Submission.create({
      task_id: taskId,
      file_path: req.file.path,
      original_filename: req.file.originalname,
      notes: notes || '',
      status: 'pending_review',
    });


    await Task.findByIdAndUpdate(taskId, { status: 'submitted' });

    res.status(201).json({
      message: 'Submission uploaded successfully',
      submission: {
        id: submission._id.toString(),
        task_id: submission.task_id.toString(),
        file_path: submission.file_path,
        original_filename: submission.original_filename,
        notes: submission.notes,
        status: submission.status,
        submitted_at: submission.submitted_at,
      }
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Server error while creating submission' });
  }
});


router.get('/task/:taskId', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;


    const task = await Task.findById(taskId).populate('project_id');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const hasAccess = task.project_id.buyer_id.toString() === req.user.id || 
                      task.project_id.assigned_solver_id?.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }


    const submissions = await Submission.find({ task_id: taskId })
      .sort({ submitted_at: -1 });

    res.json({
      submissions: submissions.map(s => ({
        id: s._id.toString(),
        task_id: s.task_id.toString(),
        file_path: s.file_path,
        original_filename: s.original_filename,
        notes: s.notes,
        status: s.status,
        review_notes: s.review_notes,
        submitted_at: s.submitted_at,
        reviewed_at: s.reviewed_at,
      })),
      count: submissions.length
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Server error while fetching submissions' });
  }
});


router.patch('/:id/accept', authenticate, requireBuyer, [
  body('reviewNotes').optional().trim(),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;


    const submission = await Submission.findById(id)
      .populate({
        path: 'task_id',
        populate: { path: 'project_id' }
      });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.task_id.project_id.buyer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const taskId = submission.task_id._id;


    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      { 
        status: 'accepted',
        review_notes: reviewNotes || '',
        reviewed_at: new Date(),
      },
      { new: true }
    );

    await Task.findByIdAndUpdate(taskId, { status: 'completed' });

    res.json({
      message: 'Submission accepted',
      submission: {
        id: updatedSubmission._id.toString(),
        status: updatedSubmission.status,
        review_notes: updatedSubmission.review_notes,
        reviewed_at: updatedSubmission.reviewed_at,
      }
    });
  } catch (error) {
    console.error('Accept submission error:', error);
    res.status(500).json({ error: 'Server error while accepting submission' });
  }
});


router.patch('/:id/reject', authenticate, requireBuyer, [
  body('reviewNotes').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Review notes required when rejecting',
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { reviewNotes } = req.body;


    const submission = await Submission.findById(id)
      .populate({
        path: 'task_id',
        populate: { path: 'project_id' }
      });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.task_id.project_id.buyer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const taskId = submission.task_id._id;


    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        review_notes: reviewNotes,
        reviewed_at: new Date(),
      },
      { new: true }
    );

    await Task.findByIdAndUpdate(taskId, { status: 'rejected' });

    res.json({
      message: 'Submission rejected',
      submission: {
        id: updatedSubmission._id.toString(),
        status: updatedSubmission.status,
        review_notes: updatedSubmission.review_notes,
        reviewed_at: updatedSubmission.reviewed_at,
      }
    });
  } catch (error) {
    console.error('Reject submission error:', error);
    res.status(500).json({ error: 'Server error while rejecting submission' });
  }
});

module.exports = router;
