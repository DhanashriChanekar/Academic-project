const mongoose = require('mongoose');

const StudentPreferenceSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    year: { type: String, required: true },
    division: { type: String, required: true },
    data: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentPreference', StudentPreferenceSchema);
