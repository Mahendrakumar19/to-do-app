require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo-app';

// Retry connecting to MongoDB instead of exiting, so a temporarily
// unavailable database (e.g. IP not yet whitelisted) doesn't kill the service.
function connect(retries = 0) {
  return mongoose
    .connect(MONGODB_URI)
    .then(() => {
      app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error(`MongoDB connection failed (attempt ${retries + 1}):`, err.message);
      if (retries < 30) {
        setTimeout(() => connect(retries + 1), 2000);
      } else {
        console.error('Giving up after 30 retries.');
        process.exit(1);
      }
    });
}

connect();