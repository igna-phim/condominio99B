import React, { useState, useEffect } from 'react';

const NotionFileViewer = () => {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('Condominio 99-B');
  
  // Comment out admin-related state
  // const [isAdmin, setIsAdmin] = useState(false);
  // const [password, setPassword] = useState('');
  // const [showPasswordModal, setShowPasswordModal] = useState(false);
  // const ADMIN_PASSWORD = "admin123";

  // Load initial files from documents folder
  useEffect(() => {
    const loadInitialFiles = async () => {
      try {
        const response = await fetch('http://localhost:3001/documents');
        const fileList = await response.json();
        
        // Convert file list to File objects
        const fileObjects = await Promise.all(
          fileList.map(async (fileName) => {
            const response = await fetch(`http://localhost:3001/documents/${fileName}`);
            const blob = await response.blob();
            return new File([blob], fileName, { type: blob.type });
          })
        );
        
        setFiles(fileObjects);
      } catch (error) {
        console.error('Error loading initial files:', error);
      }
    };

    loadInitialFiles();
  }, []);

  // Comment out admin-related handlers
  // const handleAdminLogin = () => { ... };
  // const handleAdminLogout = () => { ... };
  // const handleFileUpload = (e) => { ... };
  // const handleDeleteFile = (fileToDelete, e) => { ... };

  // Set active file for preview
  const handleFileClick = (file) => {
    setActiveFile(file);
  };

  // Get file extension
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // File preview component
  const FilePreview = ({ file }) => {
    const extension = getFileExtension(file.name);
    const [content, setContent] = useState('');
    
    useEffect(() => {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target.result);
        };
        
        // Handle text files
        if (['txt', 'md', 'js', 'jsx', 'html', 'css', 'json', 'xml'].includes(extension)) {
          reader.readAsText(file);
        } 
        // Handle images
        else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
          reader.readAsDataURL(file);
        }
        // Handle PDFs
        else if (extension === 'pdf') {
          const url = URL.createObjectURL(file);
          setContent(url);
          return () => URL.revokeObjectURL(url);
        }
      }
    }, [file, extension]);
    
    // Handle PDFs
    if (extension === 'pdf') {
      return (
        <div className="flex-1 h-full bg-gray-100 rounded-md overflow-hidden">
          <iframe
            src={content}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        </div>
      );
    } 
    // Handle images
    else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 p-4 rounded-md">
          <img src={content} alt="Preview" className="max-h-full max-w-full object-contain" />
        </div>
      );
    } 
    // Handle text files
    else if (['txt', 'md', 'js', 'jsx', 'html', 'css', 'json', 'xml'].includes(extension)) {
      return (
        <div className="h-64 bg-gray-100 p-4 rounded-md overflow-y-auto">
          <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      );
    } 
    // Handle other file types
    else {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 p-4 rounded-md">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6H4v12zM4 4h12V2H4v2zm-1 15V1h14v18H3z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Preview Not Available for {extension.toUpperCase()} files</p>
          </div>
        </div>
      );
    }
  };

  // Comment out PasswordModal component
  // const PasswordModal = () => { ... };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="text-2xl font-bold focus:outline-none"
          readOnly={true}
        />
        <div className="flex items-center space-x-2">
          {/* Comment out admin buttons */}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-600">Files</h2>
            </div>
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-sm text-gray-500">No files yet</p>
              ) : (
                files.map((file, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-2 rounded cursor-pointer ${activeFile === file ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 mr-2">
                      <span className="text-xs font-bold text-gray-500">
                        {getFileExtension(file.name).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeFile ? (
            <div className="space-y-6 h-full">
              <h1 className="text-xl font-semibold">{activeFile.name}</h1>
              <FilePreview file={activeFile} />
              {getFileExtension(activeFile.name) !== 'pdf' && (
                <div className="space-y-2">
                  <h2 className="text-lg font-medium">Notes</h2>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this file..."
                    readOnly={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
                <p className="mt-2">Select a file to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment out Password modal */}
    </div>
  );
};

export default NotionFileViewer;