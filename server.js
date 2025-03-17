import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Serve documents folder
app.use('/documents', express.static(join(__dirname, 'public/documents')));

// Get list of files
app.get('/documents', (req, res) => {
    const documentsPath = join(__dirname, 'public/documents');
    
    try {
        const files = fs.readdirSync(documentsPath);
        const fileList = files.filter(file => {
            const filePath = join(documentsPath, file);
            return fs.statSync(filePath).isFile();
        });
        res.json(fileList);
    } catch (error) {
        console.error('Error reading documents directory:', error);
        res.status(500).json({ error: 'Failed to read documents directory' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

export default app; 