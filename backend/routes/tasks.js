// ─── routes/tasks.js ───────────────────────────────────────────────────────────
// All routes protected by auth middleware.
//
// GET    /api/tasks        → fetch all tasks for logged-in user
// POST   /api/tasks        → create task
// PUT    /api/tasks/:id    → update task (owner only)
// DELETE /api/tasks/:id    → delete task (owner only)

const express = require('express');
const Task    = require('../models/Task');
const auth    = require('../middleware/auth');

const router = express.Router();
router.use(auth); // protect every route in this file

// ── GET all tasks ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, priority, tag, pinned } = req.query;
    const filter = { user: req.user.id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (tag)      filter.tags     = tag;
    if (pinned)   filter.pinned   = pinned === 'true';

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST create task ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, tags, subtasks, dueDate, pinned } = req.body;
    const task = await Task.create({
      user: req.user.id,
      title, description, status, priority,
      tags:     tags     || [],
      subtasks: subtasks || [],
      dueDate:  dueDate  || null,
      pinned:   pinned   || false,
    });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT update task ───────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' });

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE task ───────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
