const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

function toDQProResponse(dqpro) {
  return {
    id: dqpro.id,
    deviceId: dqpro.deviceId,
    name: dqpro.name,
    status: dqpro.status,
    cpuUsagePercent: dqpro.cpuUsagePercent,
    memoryUsagePercent: dqpro.memoryUsagePercent,
    thermalStatus: dqpro.thermalStatus,
    powerUsageWatts: dqpro.powerUsageWatts,
    lastOptimizationAt: dqpro.lastOptimizationAt,
    optimizationCount: dqpro.optimizationCount,
    createdAt: dqpro.createdAt,
    updatedAt: dqpro.updatedAt,
  };
}

function validateDQProInput(body, { partial = false } = {}) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('Request body must be a JSON object');
    return errors;
  }

  const { deviceId, name, status, cpuUsagePercent, memoryUsagePercent, thermalStatus, powerUsageWatts } = body;

  if (!partial || deviceId !== undefined) {
    if (typeof deviceId !== 'string' || deviceId.trim().length === 0) {
      errors.push('deviceId is required and must be a non-empty string');
    }
  }

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string');
    }
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || status.trim().length === 0) {
      errors.push('status must be a non-empty string');
    }
  }

  if (cpuUsagePercent !== undefined && cpuUsagePercent !== null) {
    if (typeof cpuUsagePercent !== 'number' || cpuUsagePercent < 0 || cpuUsagePercent > 100) {
      errors.push('cpuUsagePercent must be a number between 0 and 100');
    }
  }

  if (memoryUsagePercent !== undefined && memoryUsagePercent !== null) {
    if (typeof memoryUsagePercent !== 'number' || memoryUsagePercent < 0 || memoryUsagePercent > 100) {
      errors.push('memoryUsagePercent must be a number between 0 and 100');
    }
  }

  if (thermalStatus !== undefined && thermalStatus !== null) {
    if (typeof thermalStatus !== 'string' || thermalStatus.trim().length === 0) {
      errors.push('thermalStatus must be a non-empty string');
    }
  }

  if (powerUsageWatts !== undefined && powerUsageWatts !== null) {
    if (typeof powerUsageWatts !== 'number' || !isFinite(powerUsageWatts) || powerUsageWatts < 0) {
      errors.push('powerUsageWatts must be a non-negative finite number');
    }
  }

  return errors;
}

function isRecordNotFoundError(err) {
  return typeof err === 'object' && err !== null && err.code === 'P2025';
}

// GET /api/dqpro
router.get('/', async (req, res, next) => {
  try {
    const devices = await prisma.dqpro.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(devices.map(toDQProResponse));
  } catch (err) {
    next(err);
  }
});

// GET /api/dqpro/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid device id' });
    }
    const device = await prisma.dqpro.findUnique({ where: { id } });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(toDQProResponse(device));
  } catch (err) {
    next(err);
  }
});

// POST /api/dqpro
router.post('/', async (req, res, next) => {
  try {
    const errors = validateDQProInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const { deviceId, name, status, cpuUsagePercent, memoryUsagePercent, thermalStatus, powerUsageWatts } = req.body;
    const device = await prisma.dqpro.create({
      data: {
        deviceId: deviceId.trim(),
        name: name.trim(),
        status: status?.trim() || 'active',
        cpuUsagePercent: cpuUsagePercent ?? null,
        memoryUsagePercent: memoryUsagePercent ?? null,
        thermalStatus: thermalStatus ?? null,
        powerUsageWatts: powerUsageWatts ?? null,
      },
    });
    res.status(201).json(toDQProResponse(device));
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Device with this deviceId already exists' });
    }
    next(err);
  }
});

// PUT /api/dqpro/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid device id' });
    }
    const errors = validateDQProInput(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { deviceId, name, status, cpuUsagePercent, memoryUsagePercent, thermalStatus, powerUsageWatts } = req.body;
    const device = await prisma.dqpro.update({
      where: { id },
      data: {
        ...(deviceId !== undefined && { deviceId: deviceId.trim() }),
        ...(name !== undefined && { name: name.trim() }),
        ...(status !== undefined && { status: status.trim() }),
        ...(cpuUsagePercent !== undefined && { cpuUsagePercent }),
        ...(memoryUsagePercent !== undefined && { memoryUsagePercent }),
        ...(thermalStatus !== undefined && { thermalStatus }),
        ...(powerUsageWatts !== undefined && { powerUsageWatts }),
      },
    });
    res.json(toDQProResponse(device));
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return res.status(404).json({ error: 'Device not found' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Device with this deviceId already exists' });
    }
    next(err);
  }
});

// DELETE /api/dqpro/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid device id' });
    }
    await prisma.dqpro.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      return res.status(404).json({ error: 'Device not found' });
    }
    next(err);
  }
});

module.exports = router;
