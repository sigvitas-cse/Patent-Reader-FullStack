const multer = require('multer');
const { processDocument } = require('./docProcessor');

// Configure multer for file uploads with validation
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only .docx files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Handle file upload and processing
async function uploadFile(req, res) {
  try {
    // Check if file is present
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded or file is empty.' });
    }

    // Validate file size
    if (req.file.size === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty.' });
    }

    const fileName = req.file.originalname.replace('.docx', '');
    const buffer = req.file.buffer;

    // Process the document
    const responseData = await processDocument(buffer, fileName);

    // Send response
    res.json(responseData);
  } catch (error) {
    console.error('Error processing file:', error.message);
    res.status(500).json({ error: `Error processing the .docx file: ${error.message}` });
  }
}

module.exports = { upload, uploadFile };