const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['In Progress', 'Completed'];

// Create (partial = false): title and dueAt are required.
// Update (partial = true): only provided fields are validated.
function validateTask(body = {}, { partial = false } = {}) {
  const errors = {};
  const value = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) errors.title = 'Title is required';
    else value.title = body.title.trim();
  }

  if (body.description !== undefined) {
    value.description = String(body.description).trim();
  }

  if (!partial || body.dueAt !== undefined) {
    const date = new Date(body.dueAt);
    if (!body.dueAt || Number.isNaN(date.getTime())) errors.dueAt = 'A valid start time is required';
    else value.dueAt = date;
  }

  if (body.endAt !== undefined) {
    if (body.endAt === null || body.endAt === '') {
      value.endAt = null;
    } else {
      const end = new Date(body.endAt);
      if (Number.isNaN(end.getTime())) errors.endAt = 'End time is invalid';
      else value.endAt = end;
    }
  }

  if (value.endAt && value.dueAt && value.endAt <= value.dueAt) {
    errors.endAt = 'End time must be after start time';
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) errors.priority = 'Priority must be Low, Medium, or High';
    else value.priority = body.priority;
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) errors.status = 'Status must be In Progress or Completed';
    else value.status = body.status;
  }

  return { errors, value };
}

module.exports = { validateTask, PRIORITIES, STATUSES };
