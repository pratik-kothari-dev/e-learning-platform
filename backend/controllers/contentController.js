const SiteContent = require('../models/SiteContent');

// @desc    Get page content by ID
// @route   GET /api/content/:pageId
// @access  Public
const getContent = async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const content = await SiteContent.findOne({ pageId });
    if (content) {
      res.json(content);
    } else {
      res.json({ pageId, content: '' }); // Return empty if not created yet
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update page content
// @route   PUT /api/content/:pageId
// @access  Private/Admin
const updateContent = async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const { content } = req.body;

    let siteContent = await SiteContent.findOne({ pageId });

    if (siteContent) {
      siteContent.content = content;
      const updatedContent = await siteContent.save();
      res.json(updatedContent);
    } else {
      const newContent = new SiteContent({ pageId, content });
      const createdContent = await newContent.save();
      res.status(201).json(createdContent);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getContent, updateContent };
