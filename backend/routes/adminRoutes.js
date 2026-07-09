const express = require('express');
const router = express.Router();
const { getAdminStats, getPendingInstructors, approveInstructor, rejectInstructor, getAllUsers, toggleBlockUser, deleteUser, getGlobalEnrollments, deleteEnrollment } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, admin, getAdminStats);
router.route('/instructors/pending').get(protect, admin, getPendingInstructors);
router.route('/instructors/:id/approve').put(protect, admin, approveInstructor);
router.route('/instructors/:id/reject').put(protect, admin, rejectInstructor);

router.route('/users')
  .get(protect, admin, getAllUsers);
router.route('/users/:id/block')
  .put(protect, admin, toggleBlockUser);
router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.route('/enrollments')
  .get(protect, admin, getGlobalEnrollments);
router.route('/enrollments/:id')
  .delete(protect, admin, deleteEnrollment);

module.exports = router;
