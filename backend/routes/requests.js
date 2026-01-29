
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireSolver, requireBuyer } = require('../middleware/auth');
const { ProjectRequest, Project, User } = require('../models');
const mongoose = require('mongoose');

router.post('/', authenticate, requireSolver, [
  body('projectId').notEmpty(),
  body('message').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, message } = req.body;


    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ error: 'Project is not open for requests' });
    }


    const existingRequest = await ProjectRequest.findOne({
      project_id: projectId,
      solver_id: req.user.id
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You have already requested this project' });
    }

    const request = await ProjectRequest.create({
      project_id: projectId,
      solver_id: req.user.id,
      message: message || '',
      status: 'pending',
    });

    res.status(201).json({
      message: 'Request submitted successfully',
      request: {
        id: request._id.toString(),
        project_id: request.project_id.toString(),
        solver_id: request.solver_id.toString(),
        message: request.message,
        status: request.status,
        created_at: request.createdAt,
      }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Server error while creating request' });
  }
});


router.get('/project/:projectId', authenticate, requireBuyer, async (req, res) => {
  try {
    const { projectId } = req.params;


    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.buyer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }


    const requests = await ProjectRequest.find({ project_id: projectId })
      .populate('solver_id', 'name email profile_info')
      .sort({ createdAt: -1 });

    res.json({
      requests: requests.map(r => ({
        id: r._id.toString(),
        project_id: r.project_id.toString(),
        solver_id: r.solver_id._id.toString(),
        solver_name: r.solver_id.name,
        solver_email: r.solver_id.email,
        profile_info: r.solver_id.profile_info,
        message: r.message,
        status: r.status,
        created_at: r.createdAt,
      })),
      count: requests.length
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Server error while fetching requests' });
  }
});


router.patch('/:id/accept', authenticate, requireBuyer, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {

    const request = await ProjectRequest.findById(req.params.id)
      .populate('project_id')
      .session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Request not found' });
    }

    const project = request.project_id;

   
    if (project.buyer_id.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Access denied' });
    }

    
    if (project.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Project is not open' });
    }


    await ProjectRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { session }
    );


    await ProjectRequest.updateMany(
      { 
        project_id: project._id,
        _id: { $ne: req.params.id },
        status: 'pending'
      },
      { status: 'rejected' },
      { session }
    );


    const updatedProject = await Project.findByIdAndUpdate(
      project._id,
      { 
        status: 'assigned',
        assigned_solver_id: request.solver_id
      },
      { new: true, session }
    );

    await session.commitTransaction();

    res.json({
      message: 'Request accepted and project assigned',
      project: {
        id: updatedProject._id.toString(),
        status: updatedProject.status,
        assigned_solver_id: updatedProject.assigned_solver_id.toString(),
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Server error while accepting request' });
  } finally {
    session.endSession();
  }
});


router.patch('/:id/reject', authenticate, requireBuyer, async (req, res) => {
  try {

    const request = await ProjectRequest.findById(req.params.id)
      .populate('project_id');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }


    if (request.project_id.buyer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedRequest = await ProjectRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    res.json({
      message: 'Request rejected',
      request: {
        id: updatedRequest._id.toString(),
        status: updatedRequest.status,
      }
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Server error while rejecting request' });
  }
});


router.get('/my-requests', authenticate, requireSolver, async (req, res) => {
  try {
    const requests = await ProjectRequest.find({ solver_id: req.user.id })
      .populate('project_id')
      .sort({ createdAt: -1 });

    const requestsWithBuyer = await Promise.all(requests.map(async (r) => {
      const buyer = await User.findById(r.project_id.buyer_id).select('name email');
      return {
        id: r._id.toString(),
        project_id: r.project_id._id.toString(),
        project_title: r.project_id.title,
        project_description: r.project_id.description,
        buyer_name: buyer.name,
        message: r.message,
        status: r.status,
        created_at: r.createdAt,
      };
    }));

    res.json({
      requests: requestsWithBuyer,
      count: requestsWithBuyer.length
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Server error while fetching requests' });
  }
});

module.exports = router;
