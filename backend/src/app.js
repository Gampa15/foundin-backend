const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const startupRoutes = require('./routes/startup.routes');
const ideaRoutes = require('./routes/idea.routes');
const verificationRoutes = require('./routes/verification.routes');
const fraudRoutes = require('./routes/fraud.routes');
const messagingRoutes = require('./routes/messaging.routes');
const jobRoutes = require('./routes/job.routes');
const adRoutes = require('./routes/ad.routes');

const errorHandler = require('./middlewares/error.middleware');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimit.middleware');

const app = express();

/* ---------- GLOBAL MIDDLEWARES FIRST ---------- */
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(
  mongoSanitize({
    allowDots: true,
    replaceWith: '_'
  })
);

app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ---------- RATE LIMITERS ---------- */
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

/* ---------- ROUTES ---------- */
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ads', adRoutes);

app.get('/', (req, res) => {
  res.send('FoundIn API running');
});

/* ---------- ERROR HANDLER LAST ---------- */
app.use(errorHandler);

module.exports = app;
