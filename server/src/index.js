require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const recipesRouter = require('./routes/recipes');
const modelsRouter = require('./routes/models');

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(compression());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/recipes', recipesRouter);
app.use('/api/models', modelsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TestCook01 API server listening on http://localhost:${PORT}`);
});
