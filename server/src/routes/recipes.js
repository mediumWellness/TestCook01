const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

function toRecipeResponse(recipe) {
  return {
    ...recipe,
    ingredients: recipe.ingredients.split('\n').filter((line) => line.trim().length > 0),
  };
}

function validateRecipeInput(body, { partial = false } = {}) {
  const errors = [];
  const { title, ingredients, instructions } = body;

  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('title is required and must be a non-empty string');
    }
  }
  if (!partial || ingredients !== undefined) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      errors.push('ingredients is required and must be a non-empty array of strings');
    }
  }
  if (!partial || instructions !== undefined) {
    if (typeof instructions !== 'string' || instructions.trim().length === 0) {
      errors.push('instructions is required and must be a non-empty string');
    }
  }
  if (body.servings !== undefined && body.servings !== null && !Number.isInteger(body.servings)) {
    errors.push('servings must be an integer');
  }
  if (
    body.cookTimeMinutes !== undefined &&
    body.cookTimeMinutes !== null &&
    !Number.isInteger(body.cookTimeMinutes)
  ) {
    errors.push('cookTimeMinutes must be an integer');
  }

  return errors;
}

function isRecordNotFoundError(err) {
  return typeof err === 'object' && err !== null && err.code === 'P2025';
}

// GET /api/recipes
router.get('/', async (req, res, next) => {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        servings: true,
        cookTimeMinutes: true,
        ingredients: true,
      },
    });
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid recipe id' });
    }
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(toRecipeResponse(recipe));
  } catch (err) {
    next(err);
  }
});

// POST /api/recipes
router.post('/', async (req, res, next) => {
  try {
    const errors = validateRecipeInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const { title, description, ingredients, instructions, servings, cookTimeMinutes } = req.body;
    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        ingredients: ingredients.join('\n'),
        instructions: instructions.trim(),
        servings: servings ?? null,
        cookTimeMinutes: cookTimeMinutes ?? null,
      },
    });
    res.status(201).json(toRecipeResponse(recipe));
  } catch (err) {
    next(err);
  }
});

// PUT /api/recipes/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid recipe id' });
    }
    const errors = validateRecipeInput(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { title, description, ingredients, instructions, servings, cookTimeMinutes } = req.body;
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(ingredients !== undefined && { ingredients: ingredients.join('\n') }),
        ...(instructions !== undefined && { instructions: instructions.trim() }),
        ...(servings !== undefined && { servings }),
        ...(cookTimeMinutes !== undefined && { cookTimeMinutes }),
      },
    });
    res.json(toRecipeResponse(recipe));
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    next(err);
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid recipe id' });
    }
    await prisma.recipe.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    next(err);
  }
});

module.exports = router;
