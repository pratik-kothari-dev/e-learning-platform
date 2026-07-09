const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: 'User' });
    const instructorCount = await User.countDocuments({ role: 'Instructor' });
    const courseCount = await Course.countDocuments();

    res.json({
      users: userCount,
      instructors: instructorCount,
      courses: courseCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending instructors
// @route   GET /api/admin/instructors/pending
// @access  Private/Admin
const getPendingInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'Instructor', approvalStatus: 'Pending' }).select('-password');
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve instructor
// @route   PUT /api/admin/instructors/:id/approve
// @access  Private/Admin
const approveInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);
    if (instructor && instructor.role === 'Instructor') {
      instructor.approvalStatus = 'Approved';
      await instructor.save();
      res.json({ message: 'Instructor approved' });
    } else {
      res.status(404).json({ message: 'Instructor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject instructor
// @route   PUT /api/admin/instructors/:id/reject
// @access  Private/Admin
const rejectInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);
    if (instructor && instructor.role === 'Instructor') {
      instructor.approvalStatus = 'Rejected';
      await instructor.save();
      res.json({ message: 'Instructor rejected' });
    } else {
      res.status(404).json({ message: 'Instructor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users internally
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['User', 'Instructor'] } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block or Unblock User
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role !== 'Admin') {
      user.isBlocked = !user.isBlocked;
      await user.save();
      res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
    } else {
      res.status(404).json({ message: 'User not found or cannot block Admin' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete User Account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role !== 'Admin') {
      // If instructor, gracefully drop associated courses
      if (user.role === 'Instructor') {
        await Course.deleteMany({ instructor: user._id });
      }
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User successfully removed' });
    } else {
      res.status(404).json({ message: 'User not found or cannot delete Admin' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all explicit course enrollments globally
// @route   GET /api/admin/enrollments
// @access  Private/Admin
const getGlobalEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('user', 'name email')
      .populate({
        path: 'course',
        select: 'title instructor',
        populate: {
          path: 'instructor',
          select: 'name email'
        }
      });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke specific layout enrollment dropping access explicitly
// @route   DELETE /api/admin/enrollments/:id
// @access  Private/Admin
const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found' });
    }
    
    // Purge corresponding User from Course explicitly maintaining alignment
    await Course.updateOne(
      { _id: enrollment.course },
      { $pull: { studentsEnrolled: enrollment.user } }
    );
    
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enrollment implicitly revoked and user dropped.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats, getPendingInstructors, approveInstructor, rejectInstructor, getAllUsers, toggleBlockUser, deleteUser, getGlobalEnrollments, deleteEnrollment };
