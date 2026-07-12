const express = require('express');

const router = express.Router();

const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// GET /api/models/test/venice
// Tests connectivity to Venice.ai and returns the list of available model IDs.
router.get('/test/venice', async (req, res, next) => {
  try {
    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ ok: false, error: 'VENICE_API_KEY not configured' });
    }
    const response = await fetch(VENICE_BASE_URL + '/models', {
      headers: { Authorization: 'Bearer ' + apiKey },
    });
    if (!response.ok) {
      const text = await response.text();
      return res
        .status(502)
        .json({ ok: false, error: 'Venice.ai returned ' + response.status + ': ' + text });
    }
    const data = await response.json();
    const models = Array.isArray(data.data) ? data.data.map((m) => m.id) : [];
    res.json({ ok: true, models });
  } catch (err) {
    next(err);
  }
});

// GET /api/models/test/ollama
// Tests connectivity to a local Ollama instance and returns the list of available model names.
router.get('/test/ollama', async (req, res, next) => {
  try {
    const response = await fetch(OLLAMA_BASE_URL + '/api/tags');
    if (!response.ok) {
      const text = await response.text();
      return res
        .status(502)
        .json({ ok: false, error: 'Ollama returned ' + response.status + ': ' + text });
    }
    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models.map((m) => m.name) : [];
    res.json({ ok: true, models });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
