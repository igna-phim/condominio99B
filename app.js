// DOM Elements
const fileList = document.getElementById('file-list');
const previewContainer = document.getElementById('preview-container');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const themeToggle = document.querySelector('.theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icons
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Initialize theme with dark mode as default
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// Theme toggle event listener
themeToggle.addEventListener('click', toggleTheme);

// Mobile menu handling
function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

menuToggle.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Close sidebar when a file is selected on mobile
if (window.innerWidth <= 768) {
    fileList.addEventListener('click', closeSidebar);
}

// File handling functions
function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function createFolderIcon() {
    return `<svg class="folder-icon" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>`;
}

function createFileIcon(extension) {
    return `<svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        <text x="50%" y="75%" text-anchor="middle" font-size="6" fill="currentColor">${extension.toUpperCase()}</text>
    </svg>`;
}

function createFolderToggle() {
    return `<svg class="folder-toggle" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>`;
}

function createFileElement(item) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    if (item.type === 'folder') {
        div.setAttribute('data-type', 'folder');
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        
        div.innerHTML = `
            ${createFolderToggle()}
            <div class="file-icon">
                ${createFolderIcon()}
            </div>
            <div class="file-info">
                <div class="file-name">${item.name}</div>
            </div>
        `;
        
        const toggle = div.querySelector('.folder-toggle');
        
        // Function to toggle folder
        const toggleFolder = (e) => {
            e.stopPropagation();
            toggle.classList.toggle('collapsed');
            folderContent.classList.toggle('collapsed');
        };
        
        // Make the entire folder div clickable
        div.addEventListener('click', toggleFolder);
        
        // Recursively create elements for folder contents
        if (item.children) {
            item.children.forEach(child => {
                folderContent.appendChild(createFileElement(child));
            });
        }
        
        const container = document.createElement('div');
        container.appendChild(div);
        container.appendChild(folderContent);
        return container;
    } else {
        div.setAttribute('data-type', 'file');
        const extension = getFileExtension(item.name);
        
        div.innerHTML = `
            <div class="file-icon">
                ${createFileIcon(extension)}
            </div>
            <div class="file-info">
                <div class="file-name">${item.name}</div>
                <div class="file-size">${formatFileSize(item.size)}</div>
            </div>
        `;
        
        div.addEventListener('click', () => showFilePreview(item));
        return div;
    }
}

async function showFilePreview(item) {
    // Remove active class from all file items
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    event.currentTarget.classList.add('active');
    
    const extension = getFileExtension(item.name);
    const fileResponse = await fetch(`/documents/${item.path}`);
    const blob = await fileResponse.blob();
    const url = URL.createObjectURL(blob);
    
    // Clear previous preview
    previewContainer.innerHTML = '';
    
    if (extension === 'pdf') {
        // Create wrapper for PDF viewer
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'pdf-preview-wrapper';
        
        // Create PDF viewer iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'pdf-preview';
        
        // Use direct file path without encoding
        iframe.src = `/documents/${item.path}`;
        iframe.title = item.name;
        
        previewWrapper.appendChild(iframe);
        previewContainer.appendChild(previewWrapper);
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        const img = document.createElement('img');
        img.className = 'image-preview';
        img.src = url;
        img.alt = item.name;
        previewContainer.appendChild(img);
    } else if (['txt', 'md', 'js', 'html', 'css'].includes(extension)) {
        const pre = document.createElement('pre');
        pre.className = 'text-preview';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            pre.textContent = e.target.result;
        };
        reader.readAsText(blob);
        
        previewContainer.appendChild(pre);
    }
}

// Load files from the documents folder
async function loadFiles() {
    try {
        // Remove the loaded class to show the spinner
        fileList.classList.remove('loaded');
        
        const response = await fetch('/documents');
        const items = await response.json();
        
        // Clear existing file elements but keep the spinner
        const spinner = fileList.querySelector('.spinner-container');
        fileList.innerHTML = '';
        fileList.appendChild(spinner);
        
        // Create file elements
        items.forEach(item => {
            fileList.appendChild(createFileElement(item));
        });
        
        // Add the loaded class to hide the spinner
        fileList.classList.add('loaded');
    } catch (error) {
        console.error('Error loading files:', error);
        fileList.innerHTML = '<div class="error">Error loading files. Please try again later.</div>';
    }
}

// Initialize the application
loadFiles(); 