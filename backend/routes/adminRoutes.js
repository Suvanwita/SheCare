const express = require('express');
const {
  createAdminArticle,
  createAdminDoctor,
  deleteAdminArticle,
  deleteAdminDoctor,
  exportAdminArticlesCsv,
  featureAdminArticle,
  getAdminArticleById,
  getAdminArticles,
  getAdminDoctorAppointments,
  getAdminDoctorById,
  getAdminDoctors,
  getAdminHealth,
  publishAdminArticle,
  refreshAdminArticleSearch,
  retrainAdminArticleRecommender,
  unfeatureAdminArticle,
  unpublishAdminArticle,
  unverifyAdminDoctor,
  updateAdminArticle,
  updateAdminDoctor,
  verifyAdminDoctor
} = require('../controllers/adminController');
const { adminOnly, auditAdminWrites } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);
router.use(auditAdminWrites);

router.get('/health', getAdminHealth);
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

module.exports = router;
