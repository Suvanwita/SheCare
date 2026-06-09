const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { connectRedis, closeRedis } = require('./config/redis');
const authRoutes = require('./routes/authRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const healthLogRoutes = require('./routes/healthLogRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const pcosRoutes = require('./routes/pcosRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const articleRoutes = require('./routes/articleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {
  generalApiRateLimiter,
  closeRateLimitStores
} = require('./middleware/rateLimiter');
const { disconnectProducer } = require('./kafka/producer');
const { closeAllQueues } = require('./queues');
const { buildArticleTrie } = require('./utils/trie/articleTrie');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = new Set([CLIENT_URL, 'http://localhost:3000']);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SheCare backend is running',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.use('/api', generalApiRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/health-logs', healthLogRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/pcos', pcosRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await connectRedis();

  buildArticleTrie()
    .then(() => {
      console.log('Article search trie built.');
    })
    .catch((error) => {
      console.error(`Article search trie build failed: ${error.message}`);
    });

  const server = app.listen(PORT, () => {
    console.log(`SheCare backend server running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down SheCare backend.`);

    server.close(async () => {
      await disconnectProducer().catch((error) => {
        console.error(`Kafka producer disconnect failed: ${error.message}`);
      });
      await closeAllQueues().catch((error) => {
        console.error(`Queue shutdown failed: ${error.message}`);
      });
      await closeRateLimitStores();
      await closeRedis();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

if (require.main === module) {
  startServer();
}

module.exports = app;
