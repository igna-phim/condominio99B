// DOM Elements
const fileList = document.getElementById('file-list');
const previewContainer = document.getElementById('preview-container');

// File handling functions
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function createFileElement(file) {
    const div = document.createElement('div');
    div.className = 'file-item';
    const extension = getFileExtension(file.name);
    
    div.innerHTML = `
        <div class="file-icon">
            <span>${extension.toUpperCase()}</span>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
    `;
    
    div.addEventListener('click', () => showFilePreview(file));
    return div;
}

function showFilePreview(file) {
    // Remove active class from all file items
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    event.currentTarget.classList.add('active');
    
    const extension = getFileExtension(file.name);
    const url = URL.createObjectURL(file);
    
    // Clear previous preview
    previewContainer.innerHTML = '';
    
    if (extension === 'pdf') {
        const iframe = document.createElement('iframe');
        iframe.className = 'pdf-preview';
        iframe.src = url;
        previewContainer.appendChild(iframe);
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        const img = document.createElement('img');
        img.className = 'image-preview';
        img.src = url;
        img.alt = file.name;
        previewContainer.appendChild(img);
    } else if (['txt', 'md', 'js', 'html', 'css'].includes(extension)) {
        const pre = document.createElement('pre');
        pre.className = 'text-preview';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            pre.textContent = e.target.result;
        };
        reader.readAsText(file);
        
        previewContainer.appendChild(pre);
    }
}

// Load files from the documents folder
async function loadFiles() {
    try {
        const response = await fetch('/documents');
        const files = await response.json();
        
        // Clear file list
        fileList.innerHTML = '';
        
        // Create file elements
        for (const fileName of files) {
            const fileResponse = await fetch(`/documents/${fileName}`);
            const blob = await fileResponse.blob();
            const file = new File([blob], fileName, { type: blob.type });
            const fileElement = createFileElement(file);
            fileList.appendChild(fileElement);
        }
    } catch (error) {
        console.error('Error loading files:', error);
        fileList.innerHTML = '<div class="error">Error loading files. Please try again later.</div>';
    }
}

// Initialize the application
loadFiles(); 