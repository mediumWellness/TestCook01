const request = require('supertest');
const express = require('express');

// We mock global.fetch before requiring the router so the router picks up the mock.
const modelsRouter = require('./models');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/models', modelsRouter);
  // Central error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}

describe('GET /api/models/test/venice', () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.VENICE_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.VENICE_API_KEY;
    } else {
      process.env.VENICE_API_KEY = originalApiKey;
    }
  });

  it('returns 503 when VENICE_API_KEY is not set', async () => {
    delete process.env.VENICE_API_KEY;
    const app = buildApp();
    const res = await request(app).get('/api/models/test/venice');
    expect(res.status).toBe(503);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/VENICE_API_KEY/);
  });

  it('returns ok:true and model list on success', async () => {
    process.env.VENICE_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 'llama-3.3-70b' }, { id: 'mistral-31-24b' }],
      }),
    });

    const app = buildApp();
    const res = await request(app).get('/api/models/test/venice');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.models).toEqual(['llama-3.3-70b', 'mistral-31-24b']);
  });

  it('returns ok:true with empty model list when data field is missing', async () => {
    process.env.VENICE_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const app = buildApp();
    const res = await request(app).get('/api/models/test/venice');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.models).toEqual([]);
  });

  it('returns 502 when Venice.ai responds with a non-ok status', async () => {
    process.env.VENICE_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    const app = buildApp();
    const res = await request(app).get('/api/models/test/venice');
    expect(res.status).toBe(502);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/401/);
    expect(res.body.error).toMatch(/Unauthorized/);
  });

  it('forwards fetch errors to the error handler', async () => {
    process.env.VENICE_API_KEY = 'test-key';
    global.fetch = jest.fn().mockRejectedValue(new Error('network failure'));

    const app = buildApp();
    const res = await request(app).get('/api/models/test/venice');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/models/test/ollama', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns ok:true and model list on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [{ name: 'llama3.2' }, { name: 'mistral' }],
      }),
    });

    const app = buildApp();
    const res = await request(app).get('/api/models/test/ollama');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.models).toEqual(['llama3.2', 'mistral']);
  });

  it('returns ok:true with empty model list when models field is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const app = buildApp();
    const res = await request(app).get('/api/models/test/ollama');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.models).toEqual([]);
  });

  it('returns 502 when Ollama responds with a non-ok status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const app = buildApp();
    const res = await request(app).get('/api/models/test/ollama');
    expect(res.status).toBe(502);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/500/);
    expect(res.body.error).toMatch(/Internal Server Error/);
  });

  it('forwards fetch errors to the error handler', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'));

    const app = buildApp();
    const res = await request(app).get('/api/models/test/ollama');
    expect(res.status).toBe(500);
  });
});
