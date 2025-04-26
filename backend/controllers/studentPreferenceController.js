const xlsx = require('xlsx');
const StudentPreference = require('../models/StudentPreference');
const fs = require('fs');

exports.uploadPreference = async (req, res) => {
  try {
    const { year, division } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded!' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(400).json({ error: 'File is missing from server!' });
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const saved = await StudentPreference.create({
      fileName: file.originalname,
      filePath: file.path, // Store file path for download
      year,
      division,
      data,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error during upload:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPreferences = async (req, res) => {
  try {
    const all = await StudentPreference.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPreferenceById = async (req, res) => {
  try {
    const file = await StudentPreference.findById(req.params.id);
    res.json(file.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePreference = async (req, res) => {
  try {
    const { year, division } = req.body;
    const updated = await StudentPreference.findByIdAndUpdate(
      req.params.id,
      { year, division },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePreference = async (req, res) => {
  try {
    const file = await StudentPreference.findByIdAndDelete(req.params.id);
    if (file?.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath); // delete the uploaded file
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
