const mongoose = require('mongoose');

const siteContentSchema = mongoose.Schema({
  pageId: {
    type: String,
    required: true,
    unique: true,
    enum: ['about', 'contact'],
  },
  content: {
    type: String,
  },
}, {
  timestamps: true,
});

const SiteContent = mongoose.model('SiteContent', siteContentSchema);
module.exports = SiteContent;
