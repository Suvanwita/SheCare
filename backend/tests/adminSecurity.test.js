const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const AuditLog = require('../models/AuditLog');
const { adminOnly, auditAdminWrites } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');
const adminRoutes = require('../routes/adminRoutes');

const waitForNextTick = () => new Promise((resolve) => setImmediate(resolve));
const adminControllerSource = fs.readFileSync(
  path.resolve(__dirname, '../controllers/adminController.js'),
  'utf8'
);

test('admin router applies auth, admin role, and audit middleware before routes', () => {
  const middlewareNames = adminRoutes.stack
    .filter((layer) => !layer.route)
    .slice(0, 3)
    .map((layer) => layer.name);

  assert.deepEqual(middlewareNames, ['<anonymous>', 'adminOnly', 'auditAdminWrites']);
});

test('admin tool routes are registered behind secured admin router', () => {
  const routes = adminRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods)
    }));

  assert.deepEqual(
    routes.filter((route) => String(route.path).startsWith('/tools')),
    [
      { path: '/tools/status', methods: ['get'] },
      { path: '/tools/seed-doctors', methods: ['post'] },
      { path: '/tools/seed-articles', methods: ['post'] },
      { path: '/tools/export-articles-csv', methods: ['post'] },
      { path: '/tools/refresh-article-trie', methods: ['post'] },
      { path: '/tools/retrain-article-recommender', methods: ['post'] }
    ]
  );
});

test('protect rejects requests without a bearer token', async () => {
  let nextError;

  protect({ headers: {} }, {}, (error) => {
    nextError = error;
  });

  await waitForNextTick();

  assert.equal(nextError.statusCode, 401);
  assert.match(nextError.message, /access token/i);
});

test('adminOnly rejects authenticated non-admin users', () => {
  let nextError;

  adminOnly({ user: { role: 'user' } }, {}, (error) => {
    nextError = error;
  });

  assert.equal(nextError.statusCode, 403);
  assert.equal(nextError.message, 'Admin access required');
});

test('adminOnly allows authenticated admin users', () => {
  let nextCalled = false;

  adminOnly({ user: { role: 'admin' } }, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test('auditAdminWrites records successful admin write actions', async () => {
  const originalCreate = AuditLog.create;
  let payload;

  AuditLog.create = async (auditPayload) => {
    payload = auditPayload;
  };

  try {
    const response = new EventEmitter();
    response.statusCode = 200;
    const request = {
      method: 'PATCH',
      baseUrl: '/api/admin',
      originalUrl: '/api/admin/users/123/role',
      params: { id: '123' },
      query: {},
      user: { _id: 'admin-user-id' },
      ip: '127.0.0.1',
      get: () => 'node-test'
    };

    auditAdminWrites(request, response, () => {});
    response.emit('finish');
    await waitForNextTick();

    assert.equal(payload.user, 'admin-user-id');
    assert.equal(payload.action, 'admin:patch');
    assert.equal(payload.entity, 'admin');
    assert.equal(payload.metadata.path, '/api/admin/users/123/role');
  } finally {
    AuditLog.create = originalCreate;
  }
});

test('admin user controller keeps self-protection guards in place', () => {
  assert.match(
    adminControllerSource,
    /You cannot remove your own admin role/
  );
  assert.match(
    adminControllerSource,
    /You cannot deactivate your own account/
  );
  assert.match(adminControllerSource, /You cannot delete your own account/);
});
