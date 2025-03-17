import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Serve static files from the documents folder
app.use('/documents', express.static(path.join(__dirname, 'public/documents')));

// Endpoint to get list of files
app.get('/api/documents', (req, res) => {
  const documentsPath = path.join(__dirname, 'public/documents');
  
  fs.readdir(documentsPath, (err, files) => {
    if (err) {
      console.error('Error reading documents directory:', err);
      return res.status(500).json({ error: 'Failed to read documents directory' });
    }
    
    // Filter out any non-file items and return the list
    const fileList = files.filter(file => {
      const filePath = path.join(documentsPath, file);
      return fs.statSync(filePath).isFile();
    });
    
    res.json(fileList);
  });
});

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app; 