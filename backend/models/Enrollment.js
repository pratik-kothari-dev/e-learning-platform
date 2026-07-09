const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completedModules: [{
    type: mongoose.Schema.Types.ObjectId, // References _id of specific module objects embedded in Course
  }],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
