const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect, instructor } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Save to an 'uploads/' folder in the backend root
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|mp4|mkv|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images, Videos and PDFs only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload file for a course
// @route   POST /api/upload
// @access  Private/Instructor
router.post('/', protect, instructor, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Construct the URL path to access the file
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

module.exports = router;
