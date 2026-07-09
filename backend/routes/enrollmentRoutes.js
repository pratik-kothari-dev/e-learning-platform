const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyEnrollments, markModuleComplete, getCertificate } = require('../controllers/enrollmentController');

router.route('/my').get(protect, getMyEnrollments);
router.route('/course/:courseId/module/:moduleId/complete').post(protect, markModuleComplete);
router.route('/:id/certificate').get(protect, getCertificate);

module.exports = router;
