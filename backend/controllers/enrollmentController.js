const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Get logged in user enrollments
// @route   GET /api/enrollments/my
// @access  Private
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark specific module as completed
// @route   POST /api/enrollments/course/:courseId/module/:moduleId/complete
// @access  Private
const markModuleComplete = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if module naturally exists inside course schema mappings
    const moduleExists = course.modules.find((mod) => mod._id.toString() === moduleId);
    if (!moduleExists) {
      return res.status(404).json({ message: 'Module not found in this course' });
    }

    // Evaluate progression
    if (!enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
    }

    // Verification step check
    if (enrollment.completedModules.length === course.modules.length) {
      enrollment.isCompleted = true;
      enrollment.certificateIssued = true;
    }

    await enrollment.save();
    
    // Return the updated enrollment
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Certificate mapping
// @route   GET /api/enrollments/:id/certificate
// @access  Private
const getCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course', 'title instructor')
      .populate('user', 'name');

    if (!enrollment) {
      return res.status(404).json({ message: 'Certificate enrollment not found' });
    }

    if (enrollment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Unauthorized access to certificate mapping' });
    }

    if (!enrollment.isCompleted) {
      return res.status(400).json({ message: 'Course must be fully completed to earn a certificate.' });
    }

    res.json({
      issueDate: enrollment.updatedAt,
      studentName: enrollment.user.name,
      courseTitle: enrollment.course.title,
      identifier: enrollment._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyEnrollments,
  markModuleComplete,
  getCertificate,
};
