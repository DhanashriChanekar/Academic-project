import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles.css'; 

const StudentPreference = () => {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState('');
  const [division, setDivision] = useState('A');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [editedYear, setEditedYear] = useState('');
  const [editedDivision, setEditedDivision] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const user = { isAdmin: true }; // Replace with actual auth logic

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/student-preference');
      setUploadedFiles(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || !year) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    formData.append('division', division);

    try {
      await axios.post('http://localhost:5000/api/student-preference/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFile(null);
      setYear('');
      setDivision('A');
      fetchUploadedFiles();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    }
  };

  const handlePreview = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student-preference/${id}`);
      setPreviewData(res.data);
    } catch (err) {
      console.error('Error loading preview:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`http://localhost:5000/api/student-preference/${id}`);
        fetchUploadedFiles();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleEdit = (file) => {
    setEditingFileId(file._id);
    setEditedYear(file.year);
    setEditedDivision(file.division);
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/student-preference/${id}`, {
        year: editedYear,
        division: editedDivision,
      });
      setEditingFileId(null);
      fetchUploadedFiles();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const groupedFiles = uploadedFiles.reduce((acc, file) => {
    const key = `${file.year}-${file.division}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(file);
    return acc;
  }, {});

  const handleDownload = (id) => {
    window.open(`http://localhost:5000/api/student-preference/download/${id}`, '_blank');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">The Student Preference Form Link</h2>
      <p className="mb-4">
      <a
  href="https://docs.google.com/forms/d/e/1FAIpQLSc-Mvg0qaY2xbzSZr0go0FZovNjiZcJnie7V5RLpuwDjxVQSA/viewform"
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 underline"
>
  Open Google Form
</a>
      </p>

      {user.isAdmin && (
        <>
          <h3 className="text-xl font-semibold mb-2">Upload Excel File</h3>
          <form onSubmit={handleFileUpload} className="space-y-2 mb-6">
            <input
              className="border px-3 py-2 rounded w-full"
              type="text"
              placeholder="Academic Year (e.g. 2023-24)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
            <select
              className="border px-3 py-2 rounded w-full"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <input
              className="border px-3 py-2 rounded w-full"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
              Upload
            </button>
          </form>
        </>
      )}

      <input
        type="text"
        placeholder="Search by academic year (e.g., 2023-24)"
        className="border px-3 py-2 rounded w-full mb-6"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="space-y-6">
        {Object.entries(groupedFiles)
          .filter(([group]) => group.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(([group, files]) => (
            <div key={group} className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold mb-2">Year-Division: {group}</h4>
              {files.map(file => (
                <div key={file._id} className="flex items-center justify-between mb-2">
                  <span
                    className="text-blue-700 underline cursor-pointer"
                    onClick={() => handlePreview(file._id)}
                  >
                    {file.fileName}
                  </span>

                  {user.isAdmin && (
                    <div className="flex gap-2">
                      {editingFileId === file._id ? (
                        <>
                          <input
                            className="border px-2 py-1 rounded"
                            value={editedYear}
                            onChange={(e) => setEditedYear(e.target.value)}
                          />
                          <select
                            className="border px-2 py-1 rounded"
                            value={editedDivision}
                            onChange={(e) => setEditedDivision(e.target.value)}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                          </select>
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded"
                            onClick={() => handleSaveEdit(file._id)}
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(file)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(file._id)}
                          >
                            Delete
                          </button>
                          <button
                            className="download-btn"
                            onClick={() => handleDownload(file._id)}
                          >
                            Download
                          </button>

                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>

      {previewData && (
        <div className="mt-8 bg-white p-4 rounded shadow overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">File Preview</h3>
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 border-b">
              <tr>
                {Object.keys(previewData[0]).map((key, idx) => (
                  <th key={idx} className="px-4 py-2 text-left border">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 border-b">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-4 py-2 border">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentPreference;
