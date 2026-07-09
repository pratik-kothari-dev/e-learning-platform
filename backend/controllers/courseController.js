const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = async (req, res) => {
  try {
    const { title, description, category, thumbnailUrl, modules } = req.body;

    const course = new Course({
      title,
      description,
      category: category || 'General',
      instructor: req.user._id,
      thumbnailUrl,
      modules: modules || [],
      studentsEnrolled: [],
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in instructor courses
// @route   GET /api/courses/instructor
// @access  Private/Instructor
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = async (req, res) => {
  try {
    const { title, description, category, thumbnailUrl, modules } = req.body;

    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to update this course' });
      }

      course.title = title || course.title;
      course.description = description || course.description;
      if (category) course.category = category;
      course.thumbnailUrl = thumbnailUrl !== undefined ? thumbnailUrl : course.thumbnailUrl;
      if (modules) course.modules = modules;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to delete this course' });
      }

      await Course.findByIdAndDelete(req.params.id);
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses (For users/homepage)
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll logged in user in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.studentsEnrolled.find(
      (student) => student.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    course.studentsEnrolled.push(req.user._id);
    await course.save();

    // Create persistent relational progress tracker
    const newEnrollment = new Enrollment({
      user: req.user._id,
      course: req.params.id,
      completedModules: [],
      isCompleted: false,
      certificateIssued: false
    });
    await newEnrollment.save();

    res.status(201).json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review explicitly
// @route   POST /api/courses/:id/reviews
// @access  Private
const createCourseReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);

    if (course) {
      const alreadyReviewed = course.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Course already reviewed by you explicitly.' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      course.reviews.push(review);
      course.numReviews = course.reviews.length;
      course.rating =
        course.reviews.reduce((acc, item) => item.rating + acc, 0) /
        course.reviews.length;

      await course.save();
      res.status(201).json({ message: 'Review successfully organically added' });
    } else {
      res.status(404).json({ message: 'Course natively not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  getCourses,
  getCourseById,
  enrollCourse,
  createCourseReview,
};
