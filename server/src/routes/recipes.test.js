const request = require('supertest');
const express = require('express');

const mockPrisma = {
  recipe: {
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock('../prismaClient', () => mockPrisma);

const recipesRouter = require('./recipes');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/recipes', recipesRouter);
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}

describe('recipe write routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns summary fields for recipe list without ingredient splitting', async () => {
    mockPrisma.recipe.findMany.mockResolvedValue([
      {
        id: 7,
        title: 'Weeknight Pasta',
        description: 'Fast and simple',
        servings: 4,
        cookTimeMinutes: 20,
      },
    ]);

    const app = buildApp();
    const res = await request(app).get('/api/recipes');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 7,
        title: 'Weeknight Pasta',
        description: 'Fast and simple',
        servings: 4,
        cookTimeMinutes: 20,
      },
    ]);
    expect(mockPrisma.recipe.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        servings: true,
        cookTimeMinutes: true,
      },
    });
  });

  it('updates a recipe without a pre-read query', async () => {
    mockPrisma.recipe.update.mockResolvedValue({
      id: 42,
      title: 'Updated soup',
      description: 'Still tasty',
      ingredients: 'Stock\nNoodles',
      instructions: 'Simmer',
      servings: 2,
      cookTimeMinutes: 15,
    });

    const app = buildApp();
    const res = await request(app).put('/api/recipes/42').send({
      title: 'Updated soup',
      ingredients: ['Stock', 'Noodles'],
    });

    expect(res.status).toBe(200);
    expect(res.body.ingredients).toEqual(['Stock', 'Noodles']);
    expect(mockPrisma.recipe.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.recipe.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        title: 'Updated soup',
        ingredients: 'Stock\nNoodles',
      },
    });
  });

  it('rejects ingredient arrays that contain blank entries', async () => {
    const app = buildApp();
    const res = await request(app).put('/api/recipes/42').send({
      ingredients: ['Stock', ''],
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('ingredients is required and must be a non-empty array of strings');
    expect(mockPrisma.recipe.update).not.toHaveBeenCalled();
  });

  it('rejects ingredient arrays that contain entries with newlines', async () => {
    const app = buildApp();
    const res = await request(app).put('/api/recipes/42').send({
      ingredients: ['Stock', 'Bad\nNewline'],
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('ingredients is required and must be a non-empty array of strings');
    expect(mockPrisma.recipe.update).not.toHaveBeenCalled();
  });

  it('returns 404 when update targets a missing recipe', async () => {
    mockPrisma.recipe.update.mockRejectedValue({ code: 'P2025' });

    const app = buildApp();
    const res = await request(app).put('/api/recipes/42').send({
      title: 'Updated soup',
      ingredients: ['Stock'],
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Recipe not found' });
    expect(mockPrisma.recipe.findUnique).not.toHaveBeenCalled();
  });

  it('deletes a recipe without a pre-read query', async () => {
    mockPrisma.recipe.delete.mockResolvedValue({ id: 42 });

    const app = buildApp();
    const res = await request(app).delete('/api/recipes/42');

    expect(res.status).toBe(204);
    expect(mockPrisma.recipe.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.recipe.delete).toHaveBeenCalledWith({ where: { id: 42 } });
  });

  it('returns 404 when delete targets a missing recipe', async () => {
    mockPrisma.recipe.delete.mockRejectedValue({ code: 'P2025' });

    const app = buildApp();
    const res = await request(app).delete('/api/recipes/42');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Recipe not found' });
    expect(mockPrisma.recipe.findUnique).not.toHaveBeenCalled();
  });
});
