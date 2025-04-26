const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadPreference,
  getAllPreferences,
  getPreferenceById,
  updatePreference,
  deletePreference
} = require('../controllers/studentPreferenceController');
const StudentPreference = require('../models/StudentPreference');

// Multer config
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return cb(new Error('Only Excel files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload route
router.post('/upload', upload.single('file'), uploadPreference);

// All preferences
router.get('/', getAllPreferences);

// Get preference by ID
router.get('/:id', getPreferenceById);

// Update preference
router.put('/:id', updatePreference);

// Delete preference
router.delete('/:id', deletePreference);

// Download route
router.get('/download/:id', async (req, res) => {
  try {
    const file = await StudentPreference.findById(req.params.id);
    if (!file) return res.status(404).send('File not found');

    if (!fs.existsSync(file.filePath)) return res.status(404).send('File is missing on server');

    res.download(file.filePath, file.fileName);
  } catch (err) {
    console.error('Error in download route:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
