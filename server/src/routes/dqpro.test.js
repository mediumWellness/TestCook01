const request = require('supertest');
const express = require('express');
const dqproRouter = require('./dqpro');
const prisma = require('../prismaClient');

jest.mock('../prismaClient', () => ({
  dqpro: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/', dqproRouter);

describe('DQPro Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    test('should return all devices ordered by createdAt descending', async () => {
      const mockDevices = [
        {
          id: 2,
          deviceId: 'dq-002',
          name: 'Device 2',
          status: 'active',
          cpuUsagePercent: 45.5,
          memoryUsagePercent: 60.0,
          thermalStatus: 'normal',
          powerUsageWatts: 150.0,
          lastOptimizationAt: new Date('2026-10-14T10:00:00Z'),
          optimizationCount: 5,
          createdAt: new Date('2026-10-14T12:00:00Z'),
          updatedAt: new Date('2026-10-14T12:30:00Z'),
        },
        {
          id: 1,
          deviceId: 'dq-001',
          name: 'Device 1',
          status: 'active',
          cpuUsagePercent: 32.1,
          memoryUsagePercent: 50.0,
          thermalStatus: 'normal',
          powerUsageWatts: 120.0,
          lastOptimizationAt: null,
          optimizationCount: 0,
          createdAt: new Date('2026-10-14T11:00:00Z'),
          updatedAt: new Date('2026-10-14T11:00:00Z'),
        },
      ];

      prisma.dqpro.findMany.mockResolvedValue(mockDevices);

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].deviceId).toBe('dq-002');
      expect(response.body[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(response.body[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(prisma.dqpro.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    test('should handle database errors', async () => {
      prisma.dqpro.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /:id', () => {
    test('should return a device by id', async () => {
      const mockDevice = {
        id: 1,
        deviceId: 'dq-001',
        name: 'Device 1',
        status: 'active',
        cpuUsagePercent: 32.1,
        memoryUsagePercent: 50.0,
        thermalStatus: 'normal',
        powerUsageWatts: 120.0,
        lastOptimizationAt: null,
        optimizationCount: 0,
        createdAt: new Date('2026-10-14T11:00:00Z'),
        updatedAt: new Date('2026-10-14T11:00:00Z'),
      };

      prisma.dqpro.findUnique.mockResolvedValue(mockDevice);

      const response = await request(app).get('/1');

      expect(response.status).toBe(200);
      expect(response.body.deviceId).toBe('dq-001');
      expect(response.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(response.body.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(prisma.dqpro.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    test('should return 404 for non-existent device', async () => {
      prisma.dqpro.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Device not found' });
    });

    test('should return 400 for invalid id', async () => {
      const response = await request(app).get('/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid device id' });
      expect(prisma.dqpro.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('POST /', () => {
    test('should create a device with required fields', async () => {
      const payload = {
        deviceId: 'dq-001',
        name: 'Device 1',
      };

      const mockDevice = {
        id: 1,
        ...payload,
        status: 'active',
        cpuUsagePercent: null,
        memoryUsagePercent: null,
        thermalStatus: null,
        powerUsageWatts: null,
        lastOptimizationAt: null,
        optimizationCount: 0,
        createdAt: new Date('2026-10-14T11:00:00Z'),
        updatedAt: new Date('2026-10-14T11:00:00Z'),
      };

      prisma.dqpro.create.mockResolvedValue(mockDevice);

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.deviceId).toBe('dq-001');
      expect(response.body.name).toBe('Device 1');
      expect(response.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(response.body.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(prisma.dqpro.create).toHaveBeenCalledWith({
        data: {
          deviceId: 'dq-001',
          name: 'Device 1',
          status: 'active',
          cpuUsagePercent: null,
          memoryUsagePercent: null,
          thermalStatus: null,
          powerUsageWatts: null,
        },
      });
    });

    test('should create a device with all fields', async () => {
      const payload = {
        deviceId: 'dq-001',
        name: 'Device 1',
        status: 'active',
        cpuUsagePercent: 45.5,
        memoryUsagePercent: 60.0,
        thermalStatus: 'normal',
        powerUsageWatts: 150.0,
      };

      const mockDevice = {
        id: 1,
        ...payload,
        lastOptimizationAt: null,
        optimizationCount: 0,
        createdAt: new Date('2026-10-14T11:00:00Z'),
        updatedAt: new Date('2026-10-14T11:00:00Z'),
      };

      prisma.dqpro.create.mockResolvedValue(mockDevice);

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.deviceId).toBe('dq-001');
      expect(response.body.cpuUsagePercent).toBe(45.5);
      expect(response.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(response.body.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('should reject request with missing deviceId', async () => {
      const payload = {
        name: 'Device 1',
      };

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('deviceId is required and must be a non-empty string');
    });

    test('should reject request with missing name', async () => {
      const payload = {
        deviceId: 'dq-001',
      };

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('name is required and must be a non-empty string');
    });

    test('should reject request with empty deviceId', async () => {
      const payload = {
        deviceId: '   ',
        name: 'Device 1',
      };

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('deviceId is required and must be a non-empty string');
    });

    test('should reject request with invalid cpuUsagePercent', async () => {
      const payload = {
        deviceId: 'dq-001',
        name: 'Device 1',
        cpuUsagePercent: 150,
      };

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('cpuUsagePercent must be a number between 0 and 100');
    });

    test('should reject request with invalid memoryUsagePercent', async () => {
      const payload = {
        deviceId: 'dq-001',
        name: 'Device 1',
        memoryUsagePercent: -10,
      };

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('memoryUsagePercent must be a number between 0 and 100');
    });

    test('should reject request with invalid powerUsageWatts', async () => {
      const payload = {
        deviceId: 'dq-001',
        name: 'Device 1',
        powerUsageWatts: -50,
      };

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('powerUsageWatts must be a non-negative number');
    });

    test('should return 409 for duplicate deviceId', async () => {
      const payload = {
        deviceId: 'dq-001',
        name: 'Device 1',
      };

      const err = new Error('Unique constraint failed');
      err.code = 'P2002';
      prisma.dqpro.create.mockRejectedValue(err);

      const response = await request(app).post('/').send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'Device with this deviceId already exists' });
    });
  });

  describe('PUT /:id', () => {
    test('should update a device with partial data', async () => {
      const payload = {
        name: 'Updated Device',
        cpuUsagePercent: 50.0,
      };

      const mockDevice = {
        id: 1,
        deviceId: 'dq-001',
        name: 'Updated Device',
        status: 'active',
        cpuUsagePercent: 50.0,
        memoryUsagePercent: null,
        thermalStatus: null,
        powerUsageWatts: null,
        lastOptimizationAt: null,
        optimizationCount: 0,
        createdAt: new Date('2026-10-14T11:00:00Z'),
        updatedAt: new Date('2026-10-14T12:00:00Z'),
      };

      prisma.dqpro.update.mockResolvedValue(mockDevice);

      const response = await request(app).put('/1').send(payload);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Device');
      expect(response.body.cpuUsagePercent).toBe(50.0);
      expect(response.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(response.body.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(prisma.dqpro.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Device',
          cpuUsagePercent: 50.0,
        },
      });
    });

    test('should return 404 for non-existent device', async () => {
      const payload = { name: 'Updated Device' };

      const err = new Error('Record not found');
      err.code = 'P2025';
      prisma.dqpro.update.mockRejectedValue(err);

      const response = await request(app).put('/999').send(payload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Device not found' });
    });

    test('should return 400 for invalid id', async () => {
      const response = await request(app).put('/invalid').send({ name: 'Device' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid device id' });
    });

    test('should return 409 for duplicate deviceId', async () => {
      const payload = { deviceId: 'dq-001' };

      const err = new Error('Unique constraint failed');
      err.code = 'P2002';
      prisma.dqpro.update.mockRejectedValue(err);

      const response = await request(app).put('/1').send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'Device with this deviceId already exists' });
    });

    test('should reject update with invalid cpuUsagePercent', async () => {
      const payload = { cpuUsagePercent: 200 };

      const response = await request(app).put('/1').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('cpuUsagePercent must be a number between 0 and 100');
    });
  });

  describe('DELETE /:id', () => {
    test('should delete a device', async () => {
      prisma.dqpro.delete.mockResolvedValue({});

      const response = await request(app).delete('/1');

      expect(response.status).toBe(204);
      expect(response.text).toBe('');
      expect(prisma.dqpro.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    test('should return 404 for non-existent device', async () => {
      const err = new Error('Record not found');
      err.code = 'P2025';
      prisma.dqpro.delete.mockRejectedValue(err);

      const response = await request(app).delete('/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Device not found' });
    });

    test('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid device id' });
      expect(prisma.dqpro.delete).not.toHaveBeenCalled();
    });
  });
});
