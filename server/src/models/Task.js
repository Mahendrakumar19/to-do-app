const mongoose = require('mongoose');
const { weekKey } = require('../utils/week');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    dueAt: { type: Date, required: true, index: true }, // start time
    endAt: { type: Date, default: null },               // optional end time
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
    weekKey: { type: String, index: true },
  },
  { timestamps: true }
);

taskSchema.pre('validate', function (next) {
  if (this.dueAt) this.weekKey = weekKey(this.dueAt);
  next();
});

module.exports = mongoose.model('Task', taskSchema);
