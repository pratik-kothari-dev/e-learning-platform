const express = require('express');
const router = express.Router();
const {
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  getCourses,
  getCourseById,
  enrollCourse,
  createCourseReview,
} = require('../controllers/courseController');
const { protect, instructor } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, instructor, createCourse)
  .get(getCourses);

router.route('/instructor')
  .get(protect, instructor, getInstructorCourses);

router.route('/:id')
  .get(getCourseById)
  .put(protect, instructor, updateCourse)
  .delete(protect, instructor, deleteCourse);

router.route('/:id/enroll')
  .post(protect, enrollCourse);

router.route('/:id/reviews')
  .post(protect, createCourseReview);

module.exports = router;
