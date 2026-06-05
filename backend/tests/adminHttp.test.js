const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';

const app = require('../server');
const Article = require('../models/Article');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const listen = () =>
  new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`
      });
    });
  });

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '5m'
  });

const mockUserLookup = (user) => {
  const originalFindById = User.findById;

  User.findById = () => ({
    select: async () => user
  });

  return () => {
    User.findById = originalFindById;
  };
};

test('admin health endpoint rejects missing auth token', async () => {
  const { server, baseUrl } = await listen();

  try {
    const response = await fetch(`${baseUrl}/api/admin/health`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.success, false);
  } finally {
    await close(server);
  }
});

test('admin health endpoint rejects authenticated non-admin users', async () => {
  const restoreUserLookup = mockUserLookup({
    _id: '507f1f77bcf86cd799439011',
    fullName: 'Regular User',
    role: 'user',
    isActive: true
  });
  const { server, baseUrl } = await listen();

  try {
    const response = await fetch(`${baseUrl}/api/admin/health`, {
      headers: {
        Authorization: `Bearer ${createToken('507f1f77bcf86cd799439011')}`
      }
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.success, false);
    assert.match(body.message, /admin access/i);
  } finally {
    restoreUserLookup();
    await close(server);
  }
});

test('admin health endpoint allows authenticated admins', async () => {
  const restoreUserLookup = mockUserLookup({
    _id: '507f1f77bcf86cd799439012',
    fullName: 'Admin User',
    role: 'admin',
    isActive: true
  });
  const { server, baseUrl } = await listen();

  try {
    const response = await fetch(`${baseUrl}/api/admin/health`, {
      headers: {
        Authorization: `Bearer ${createToken('507f1f77bcf86cd799439012')}`
      }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.admin, 'Admin User');
  } finally {
    restoreUserLookup();
    await close(server);
  }
});

test('admin tools status endpoint returns mocked operational status for admins', async () => {
  const restoreUserLookup = mockUserLookup({
    _id: '507f1f77bcf86cd799439013',
    fullName: 'Admin User',
    role: 'admin',
    isActive: true
  });
  const originalArticleCount = Article.countDocuments;
  const originalDoctorCount = Doctor.countDocuments;
  const originalFetch = global.fetch;
  const { server, baseUrl } = await listen();

  Article.countDocuments = async () => 6;
  Doctor.countDocuments = async () => 8;
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ status: 'ok', service: 'article-service' })
  });

  try {
    const response = await originalFetch(`${baseUrl}/api/admin/tools/status`, {
      headers: {
        Authorization: `Bearer ${createToken('507f1f77bcf86cd799439013')}`
      }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.counts.articleCount, 6);
    assert.equal(body.data.counts.doctorCount, 8);
    assert.equal(body.data.articleServiceHealth.reachable, true);
  } finally {
    restoreUserLookup();
    Article.countDocuments = originalArticleCount;
    Doctor.countDocuments = originalDoctorCount;
    global.fetch = originalFetch;
    await close(server);
  }
});
