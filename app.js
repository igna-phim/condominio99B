// DOM Elements
const fileList = document.getElementById('file-list');
const previewContainer = document.getElementById('preview-container');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const themeToggle = document.querySelector('.theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const newsHeader = document.getElementById('news-header');
const filesHeader = document.getElementById('files-header');
const newsContent = document.getElementById('news-content');
const newsToggle = newsHeader.querySelector('.section-toggle');
const filesToggle = filesHeader.querySelector('.section-toggle');

// Function to parse markdown to HTML
function parseMarkdown(text) {
    // Basic markdown parsing for common elements
    let html = text
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Handle lists - check if there are any list items
    if (html.match(/^\s*\* (.*$)/gm)) {
        // Convert list items and wrap in <ul> tags
        const listItems = html.match(/^\s*\* (.*$)/gm);
        const listItemsHtml = listItems.map(item => `<li>${item.replace(/^\s*\* /, '')}</li>`).join('');
        html = html.replace(/^\s*\* (.*$)/gm, '');
        
        // Find where to insert the list
        const insertIndex = text.indexOf('* ');
        if (insertIndex !== -1) {
            const beforeList = html.substring(0, insertIndex);
            const afterList = html.substring(insertIndex);
            html = beforeList + `<ul>${listItemsHtml}</ul>` + afterList;
        }
    }
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// News handling
async function loadNews() {
    try {
        const response = await fetch('/api/news');
        const newsData = await response.json();
        
        // Update sidebar news items
        const sidebarNewsContent = document.getElementById('news-content');
        sidebarNewsContent.innerHTML = newsData.map(news => `
            <div class="news-item" data-news-id="${news.id}">
                <p class="news-date">${news.date}</p>
                <h1 class="news-title">${news.title}</h1>
                <p class="news-text">${news.summary}</p>
            </div>
        `).join('');
        
        // Add click handlers for news items
        const newsItems = document.querySelectorAll('.news-item');
        newsItems.forEach(item => {
            item.addEventListener('click', () => {
                const newsId = parseInt(item.dataset.newsId);
                const selectedNews = newsData.find(n => n.id === newsId);
                showNewsInContent(selectedNews);
                
                // Close sidebar on mobile after selecting news
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
        });
        
        return newsData;
    } catch (error) {
        console.error('Error loading news:', error);
        return [];
    }
}

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

// Section toggle handling
function toggleSection(toggleButton, sectionContent) {
    toggleButton.classList.toggle('collapsed');
    sectionContent.classList.toggle('collapsed');
    
    // Store the state in localStorage
    const isCollapsed = sectionContent.classList.contains('collapsed');
    const sectionId = sectionContent.id;
    localStorage.setItem(`${sectionId}-collapsed`, isCollapsed.toString());
}

// Initialize section state from localStorage
function initializeSectionState() {
    const newsCollapsed = localStorage.getItem('news-content-collapsed') === 'true';
    const filesCollapsed = localStorage.getItem('file-list-collapsed') === 'true';
    
    if (newsCollapsed) {
        newsToggle.classList.add('collapsed');
        newsContent.classList.add('collapsed');
    }
    
    if (filesCollapsed) {
        filesToggle.classList.add('collapsed');
        fileList.classList.add('collapsed');
    }
}

// Section toggle event listeners
newsHeader.addEventListener('click', () => toggleSection(newsToggle, newsContent));
filesHeader.addEventListener('click', () => toggleSection(filesToggle, fileList));

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
    
    // Show loading animation before fetching file
    previewContainer.innerHTML = `
        <div class="preview-loading">
            <div class="preview-loading-spinner"></div>
            <p>Carregando ${item.name}...</p>
        </div>
    `;
    
    // Fetch file with slight delay to show loading animation
    const fileResponse = await fetch(`/documents/${item.path}`);
    const blob = await fileResponse.blob();
    const url = URL.createObjectURL(blob);
    
    // Small delay to show the loading animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear loading animation
    previewContainer.innerHTML = '';
    
    // Hide the no-file-selected div
    document.querySelector('.no-file-selected')?.remove();
    
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
            // Add a subtle fade-in animation
            pre.style.animation = 'fadeIn 0.3s ease-in-out';
        };
        reader.readAsText(blob);
        
        previewContainer.appendChild(pre);
    }
}

// Function to show news feed in the content area
function showNewsInContent(selectedNews = null) {
    // Clear previous preview
    previewContainer.innerHTML = '';
    
    // Create news container
    const newsContainer = document.createElement('div');
    newsContainer.className = 'news-container';
    
    // Create news header
    const newsHeader = document.createElement('div');
    newsHeader.className = 'news-container-header';
    newsHeader.innerHTML = `
        <h2>Notícias do Condomínio</h2>
        <p class="news-subtitle">Informações e avisos importantes</p>
    `;
    
    // Create news content
    const newsItems = document.createElement('div');
    newsItems.className = 'news-items';
    
    if (selectedNews) {
        // Show single news item with markdown support
        newsItems.innerHTML = `
            <div class="news-content-item">
                <div class="news-content-date">${selectedNews.date}</div>
                <h3 class="news-content-title">${selectedNews.title}</h3>
                <div class="news-content-text">
                    ${selectedNews.content.map(paragraph => `<p>${parseMarkdown(paragraph)}</p>`).join('')}
                </div>
            </div>
        `;
    } else {
        // Load all news items with markdown support
        fetch('/api/news')
            .then(response => response.json())
            .then(newsData => {
                newsItems.innerHTML = newsData.map(news => `
                    <div class="news-content-item">
                        <div class="news-content-date">${news.date}</div>
                        <h3 class="news-content-title">${news.title}</h3>
                        <div class="news-content-text">
                            ${news.content.map(paragraph => `<p>${parseMarkdown(paragraph)}</p>`).join('')}
                        </div>
                    </div>
                `).join('');
            })
            .catch(error => {
                console.error('Error loading news:', error);
                newsItems.innerHTML = '<div class="error">Error loading news. Please try again later.</div>';
            });
    }
    
    newsContainer.appendChild(newsHeader);
    newsContainer.appendChild(newsItems);
    previewContainer.appendChild(newsContainer);
    
    // Remove loading-initial element if it exists
    const loadingElement = document.querySelector('.loading-initial');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Remove active class from all file items
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Function to ensure the no-file-selected message is properly displayed
function ensureNoFileSelectedMessage() {
    if (!previewContainer.querySelector('.no-file-selected')) {
        const noFileDiv = document.createElement('div');
        noFileDiv.className = 'no-file-selected';
        noFileDiv.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <p>Nenhum ficheiro selecionado</p>
            <p class="mobile-instruction">Clique no menu <span class="hamburger-hint">☰</span> no canto superior direito para ver os ficheiros disponíveis</p>
            <p class="desktop-instruction">Selecione um ficheiro da lista à esquerda para visualizar</p>
        `;
        
        // Add a link to show news 
        const showNewsLink = document.createElement('a');
        showNewsLink.href = '#';
        showNewsLink.className = 'show-news-link';
        showNewsLink.textContent = 'Ver notícias recentes';
        showNewsLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Open sidebar on mobile
            if (window.innerWidth <= 768 && !sidebar.classList.contains('active')) {
                toggleSidebar();
            }
            // Make sure news section is expanded
            if (newsContent.classList.contains('collapsed')) {
                toggleSection(newsToggle, newsContent);
            }
            // Show news in content area
            showNewsInContent();
            // Scroll to news section in sidebar
            newsHeader.scrollIntoView({ behavior: 'smooth' });
        });
        
        noFileDiv.appendChild(showNewsLink);
        previewContainer.appendChild(noFileDiv);
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
        
        // Comment out: No longer needed since we show news by default
        // ensureNoFileSelectedMessage();
    } catch (error) {
        console.error('Error loading files:', error);
        fileList.innerHTML = '<div class="error">Error loading files. Please try again later.</div>';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeSectionState();
    loadFiles();
    loadNews().then(() => {
        // Show news container as default content on page load
        showNewsInContent();
    });
    
    // Add click handler to the page title
    const pageTitle = document.querySelector('.title');
    if (pageTitle) {
        pageTitle.style.cursor = 'pointer';
        pageTitle.addEventListener('click', () => {
            showNewsInContent();
        });
    }
    
    // Add event listener for the news link
    const showNewsLink = document.querySelector('.show-news-link');
    if (showNewsLink) {
        showNewsLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Open sidebar on mobile
            if (window.innerWidth <= 768 && !sidebar.classList.contains('active')) {
                toggleSidebar();
            }
            // Make sure news section is expanded
            if (newsContent.classList.contains('collapsed')) {
                toggleSection(newsToggle, newsContent);
            }
            // Show news in content area
            showNewsInContent();
            // Scroll to news section in sidebar
            newsHeader.scrollIntoView({ behavior: 'smooth' });
        });
    }
}); 