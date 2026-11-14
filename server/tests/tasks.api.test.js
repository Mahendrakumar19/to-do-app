const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

const api = () => request(app).get;

test('creates a task in its Monday–Sunday week', async () => {
  const res = await request(app)
    .post('/api/tasks')
    .send({ title: 'Submit report', dueAt: '2026-11-08T10:00', priority: 'High' });

  expect(res.status).toBe(201);
  expect(res.body.weekKey).toBe('2026-11-02');
  expect(res.body.status).toBe('In Progress');
  expect(res.body.priority).toBe('High');
});

test('rejects a task without a title or date', async () => {
  const res = await request(app).post('/api/tasks').send({ description: 'No title' });

  expect(res.status).toBe(400);
  expect(res.body.errors.title).toBeDefined();
  expect(res.body.errors.dueAt).toBeDefined();
});

test('rejects an invalid priority', async () => {
  const res = await request(app)
    .post('/api/tasks')
    .send({ title: 'x', dueAt: '2026-11-10T09:00', priority: 'Urgent' });

  expect(res.status).toBe(400);
  expect(res.body.errors.priority).toBeDefined();
});

test('completing a task updates the week summary counts', async () => {
  const a = await request(app).post('/api/tasks').send({ title: 'A', dueAt: '2026-11-08T10:00' });
  await request(app).post('/api/tasks').send({ title: 'B', dueAt: '2026-11-04T09:00' });

  await request(app).put(`/api/tasks/${a.body._id}`).send({ status: 'Completed' });

  const weeks = await request(app).get('/api/tasks/weeks');
  const week = weeks.body.find((w) => w.weekKey === '2026-11-02');
  expect(week).toEqual({ weekKey: '2026-11-02', open: 1, completed: 1 });
});

test('moving a task to another date moves it to the right week', async () => {
  const created = await request(app).post('/api/tasks').send({ title: 'Move me', dueAt: '2026-11-08T10:00' });
  const updated = await request(app)
    .put(`/api/tasks/${created.body._id}`)
    .send({ dueAt: '2026-11-10T10:00' });

  expect(updated.body.weekKey).toBe('2026-11-09');
});

test('search matches title and description, case-insensitively', async () => {
  await request(app).post('/api/tasks').send({ title: 'Buy MILK', dueAt: '2026-11-10T09:00' });
  await request(app).post('/api/tasks').send({ title: 'Call mom', description: 'ask about milk', dueAt: '2026-11-11T09:00' });
  await request(app).post('/api/tasks').send({ title: 'Gym', dueAt: '2026-11-12T09:00' });

  const res = await request(app).get('/api/tasks').query({ q: 'milk' });
  expect(res.body).toHaveLength(2);
});

test('edits a task and deletes it', async () => {
  const created = await request(app).post('/api/tasks').send({ title: 'Old', dueAt: '2026-11-10T09:00' });
  const id = created.body._id;

  const edited = await request(app).put(`/api/tasks/${id}`).send({ title: 'New', priority: 'Low' });
  expect(edited.body.title).toBe('New');
  expect(edited.body.priority).toBe('Low');

  const del = await request(app).delete(`/api/tasks/${id}`);
  expect(del.status).toBe(204);

  const again = await request(app).delete(`/api/tasks/${id}`);
  expect(again.status).toBe(404);
});
