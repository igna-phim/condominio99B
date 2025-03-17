import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files
app.use(express.static(__dirname));

// Serve documents folder
app.use('/documents', express.static(join(__dirname, 'public/documents')));

// Function to get file stats with type
function getFileInfo(basePath, filePath) {
    const fullPath = join(basePath, filePath);
    const stats = fs.statSync(fullPath);
    const isDirectory = stats.isDirectory();
    
    return {
        name: filePath,
        path: filePath,
        type: isDirectory ? 'folder' : 'file',
        size: isDirectory ? null : stats.size,
        lastModified: stats.mtime
    };
}

// Function to read directory recursively
function readDirRecursive(basePath, currentPath = '') {
    const fullPath = join(basePath, currentPath);
    const entries = fs.readdirSync(fullPath);
    const items = [];

    for (const entry of entries) {
        const entryPath = currentPath ? join(currentPath, entry) : entry;
        const fullEntryPath = join(basePath, entryPath);
        const stats = fs.statSync(fullEntryPath);

        if (stats.isDirectory()) {
            items.push({
                name: entry,
                path: entryPath,
                type: 'folder',
                children: readDirRecursive(basePath, entryPath)
            });
        } else {
            items.push({
                name: entry,
                path: entryPath,
                type: 'file',
                size: stats.size,
                lastModified: stats.mtime
            });
        }
    }

    // Sort: folders first, then files, both alphabetically
    return items.sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
    });
}

// Get list of files and folders
app.get('/documents', (req, res) => {
    const documentsPath = join(__dirname, 'public/documents');
    
    try {
        const items = readDirRecursive(documentsPath);
        res.json(items);
    } catch (error) {
        console.error('Error reading documents directory:', error);
        res.status(500).json({ error: 'Failed to read documents directory' });
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

export default app; 