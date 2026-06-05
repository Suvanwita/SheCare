const express = require('express');
const {
  activateAdminUser,
  createAdminArticle,
  createAdminAnnouncement,
  createAdminDoctor,
  createAdminSystemNotification,
  deleteAdminArticle,
  deleteAdminDoctor,
  deleteAdminReport,
  deleteAdminUser,
  deactivateAdminUser,
  exportAdminArticlesCsv,
  featureAdminArticle,
  getAdminArticleById,
  getAdminArticles,
  getAdminAnalyticsOverview,
  getAdminAppointments,
  getAdminDoctorAppointments,
  getAdminDoctorById,
  getAdminDoctors,
  getAdminHealth,
  getAdminNotifications,
  getAdminReportById,
  getAdminReports,
  getAdminUserById,
  getAdminUserSessions,
  getAdminUsers,
  publishAdminArticle,
  refreshAdminArticleSearch,
  resolveAdminAppointment,
  revokeAdminUserSessions,
  retrainAdminArticleRecommender,
  unfeatureAdminArticle,
  unpublishAdminArticle,
  unverifyAdminDoctor,
  updateAdminAppointmentStatus,
  updateAdminArticle,
  updateAdminDoctor,
  updateAdminUserRole,
  verifyAdminDoctor
} = require('../controllers/adminController');
const { adminOnly, auditAdminWrites } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);
router.use(auditAdminWrites);

router.get('/health', getAdminHealth);
router.get('/analytics/overview', getAdminAnalyticsOverview);
router.get('/doctors', getAdminDoctors);
router.post('/doctors', createAdminDoctor);
router.get('/doctors/:id', getAdminDoctorById);
router.patch('/doctors/:id', updateAdminDoctor);
router.delete('/doctors/:id', deleteAdminDoctor);
router.patch('/doctors/:id/verify', verifyAdminDoctor);
router.patch('/doctors/:id/unverify', unverifyAdminDoctor);
router.get('/doctors/:id/appointments', getAdminDoctorAppointments);

router.get('/articles', getAdminArticles);
router.post('/articles', createAdminArticle);
router.post('/articles/refresh-search', refreshAdminArticleSearch);
router.post('/articles/export-csv', exportAdminArticlesCsv);
router.post('/articles/retrain-recommender', retrainAdminArticleRecommender);
router.get('/articles/:id', getAdminArticleById);
router.patch('/articles/:id', updateAdminArticle);
router.delete('/articles/:id', deleteAdminArticle);
router.patch('/articles/:id/publish', publishAdminArticle);
router.patch('/articles/:id/unpublish', unpublishAdminArticle);
router.patch('/articles/:id/feature', featureAdminArticle);
router.patch('/articles/:id/unfeature', unfeatureAdminArticle);

router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserById);
router.patch('/users/:id/role', updateAdminUserRole);
router.patch('/users/:id/activate', activateAdminUser);
router.patch('/users/:id/deactivate', deactivateAdminUser);
router.get('/users/:id/sessions', getAdminUserSessions);
router.patch('/users/:id/revoke-sessions', revokeAdminUserSessions);
router.delete('/users/:id', deleteAdminUser);

router.get('/appointments', getAdminAppointments);
router.patch('/appointments/:id/status', updateAdminAppointmentStatus);
router.patch('/appointments/:id/resolve', resolveAdminAppointment);

router.get('/reports', getAdminReports);
router.get('/reports/:id', getAdminReportById);
router.delete('/reports/:id', deleteAdminReport);

router.post('/notifications/announcement', createAdminAnnouncement);
router.post('/notifications/system', createAdminSystemNotification);
router.get('/notifications', getAdminNotifications);

module.exports = router;
