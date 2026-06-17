// ─── models/Task.js ───────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, default: '', trim: true },
    status:      { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority:    { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium' },
    tags:        [{ type: String }],
    subtasks:    [SubtaskSchema],
    dueDate:     { type: Date, default: null },
    pinned:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
