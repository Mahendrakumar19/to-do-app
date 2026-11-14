const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { validateTask } = require('../utils/validate');

const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const notFound = (res) => res.status(404).json({ message: 'Task not found' });

// Weekly summaries for home screen cards
router.get(
  '/weeks',
  wrap(async (req, res) => {
    const tasks = await Task.find({}, 'weekKey status').lean();
    const map = new Map();
    for (const t of tasks) {
      if (!map.has(t.weekKey)) map.set(t.weekKey, { weekKey: t.weekKey, open: 0, completed: 0 });
      const week = map.get(t.weekKey);
      if (t.status === 'Completed') week.completed += 1;
      else week.open += 1;
    }
    res.json([...map.values()].sort((a, b) => a.weekKey.localeCompare(b.weekKey)));
  })
);

// List / search tasks
router.get(
  '/',
  wrap(async (req, res) => {
    const { q, weekKey, status } = req.query;
    const filter = {};
    if (weekKey) filter.weekKey = String(weekKey);
    if (status) filter.status = String(status);
    if (q && String(q).trim()) {
      const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ title: rx }, { description: rx }];
    }
    res.json(await Task.find(filter).sort({ dueAt: 1 }));
  })
);

router.post(
  '/',
  wrap(async (req, res) => {
    const { errors, value } = validateTask(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    const task = await Task.create(value);
    res.status(201).json(task);
  })
);

router.put(
  '/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const { errors, value } = validateTask(req.body, { partial: true });
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const task = await Task.findById(req.params.id);
    if (!task) return notFound(res);
    task.set(value);
    await task.save(); // save (not findByIdAndUpdate) so weekKey is recalculated
    res.json(task);
  })
);

router.delete(
  '/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return notFound(res);
    res.status(204).end();
  })
);

module.exports = router;
