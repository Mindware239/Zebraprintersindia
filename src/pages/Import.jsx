import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Import.css';

const Import = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('error');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServerStatus();
  }, []);

  // File validation
  const validateFile = (file) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'Please select a CSV or Excel file (.csv, .xlsx, .xls)' };
    }
    
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 20MB' };
    }
    
    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    setSelectedFile(file);
    setUploadResult(null);
    setErrors([]);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const sampleData = `name,slug,category,subcategory,shortDescription,description,specifications,sku,metaKeywords,metaTitle,metaDescription,status,featured,image,pdf
"Zebra ZD421 Desktop Printer","zebra-zd421-desktop-printer","Printers","Desktop","High-performance desktop printer","The Zebra ZD421 is a high-performance desktop printer designed for barcode labels.","Print Resolution: 203 DPI\nPrint Width: 4 inches\nConnectivity: USB, Ethernet","ZEB-ZD421","zebra printer,desktop printer,barcode printer","Zebra ZD421 Desktop Printer","Professional desktop barcode printer for small to medium businesses.","active","true","/uploads/images/zebra-zd421.jpg","/uploads/pdfs/zebra-zd421-datasheet.pdf"
"Zebra ZT411 Industrial Printer","zebra-zt411-industrial-printer","Printers","Industrial","Industrial-grade printer for heavy-duty applications","The Zebra ZT411 is built for industrial environments with heavy-duty construction.","Print Resolution: 300 DPI\nPrint Width: 6 inches\nConnectivity: USB, Ethernet, Serial","ZEB-ZT411","zebra printer,industrial printer,heavy duty printer","Zebra ZT411 Industrial Printer","Industrial-grade thermal printer for heavy-duty applications.","active","false","/uploads/images/zebra-zt411.jpg","/uploads/pdfs/zebra-zt411-datasheet.pdf"`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_products.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Download sample Excel
  const downloadSampleExcel = async () => {
    try {
      const response = await fetch('/api/import/sample-excel');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_products.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download sample Excel file');
      }
    } catch (error) {
      console.error('Error downloading sample Excel:', error);
      alert('Failed to download sample Excel file');
    }
  };

  // Export all products to CSV
  const exportProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const products = await response.json();
      
      const csvContent = [
        'name,slug,category,subcategory,shortDescription,description,specifications,sku,metaKeywords,metaTitle,metaDescription,status,featured,image,pdf',
        ...products.map(product => [
          `"${product.name || ''}"`,
          `"${product.slug || ''}"`,
          `"${product.category || ''}"`,
          `"${product.subcategory || ''}"`,
          `"${product.shortDescription || ''}"`,
          `"${product.description || ''}"`,
          `"${product.specifications || ''}"`,
          `"${product.sku || ''}"`,
          `"${product.metaKeywords || ''}"`,
          `"${product.metaTitle || ''}"`,
          `"${product.metaDescription || ''}"`,
          `"${product.status || 'active'}"`,
          `"${product.featured ? 'true' : 'false'}"`,
          `"${product.image || ''}"`,
          `"${product.pdf || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export products');
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    if (serverStatus !== 'online') {
      alert('Server is not available. Please wait for the server to come online.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress with more realistic steps
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15; // More realistic progress
        });
      }, 500);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch('http://localhost:3000/api/products/bulk-import', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setErrors([]); // Clear any previous errors
      } else {
        const errorMessage = result.error || result.message || 'Upload failed';
        setErrors([errorMessage]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      let userFriendlyMessage = 'Upload failed: ';
      
      if (error.name === 'AbortError') {
        userFriendlyMessage += 'Request timed out. The file might be too large or the server is taking too long to process.';
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        userFriendlyMessage += 'Cannot connect to server. Please make sure the backend server is running on port 5000.';
      } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        userFriendlyMessage += 'Server connection refused. Please check if the backend server is running.';
      } else if (error.message.includes('timeout')) {
        userFriendlyMessage += 'Request timed out. The file might be too large or the server is taking too long to process.';
      } else {
        userFriendlyMessage += error.message;
      }
      
      setErrors([userFriendlyMessage]);
    } finally {
      setIsUploading(false);
    }
  };

  // Download error report
  const downloadErrorReport = () => {
    if (!uploadResult || !uploadResult.failed || uploadResult.failed.length === 0) {
      return;
    }

    const errorData = uploadResult.failed.map((error, index) => ({
      'Row Number': error.rowNumber,
      'Product Name': error.productName || '',
      'Error': error.error
    }));

    const csvContent = [
      Object.keys(errorData[0]).join(','),
      ...errorData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'import_errors.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="import-page">
      <div className="import-header">
        <h1>📥 Bulk Product Import</h1>
        <p>Upload CSV or Excel files to import multiple products at once</p>
        
        {/* Server Status Indicator */}
        <div className="server-status">
          {serverStatus === 'checking' && (
            <div className="status-indicator checking">
              <span className="status-icon">🔄</span>
              <span>Checking server connection...</span>
            </div>
          )}
          {serverStatus === 'online' && (
            <div className="status-indicator online">
              <span className="status-icon">✅</span>
              <span>Server is online and ready</span>
            </div>
          )}
          {serverStatus === 'offline' && (
            <div className="status-indicator offline">
              <span className="status-icon">❌</span>
              <span>Server is offline. Please start the backend server.</span>
            </div>
          )}
          {serverStatus === 'error' && (
            <div className="status-indicator error">
              <span className="status-icon">⚠️</span>
              <span>Server error. Please check the backend server.</span>
            </div>
          )}
        </div>
      </div>

      <div className="import-container">
        {/* Instructions Section */}
        <div className="instructions-section">
          <h2>📋 Import Instructions</h2>
          <div className="instructions-grid">
            <div className="instruction-card">
              <h3>📁 Supported Formats</h3>
              <ul>
                <li>CSV files (.csv)</li>
                <li>Excel files (.xlsx, .xls)</li>
                <li>Maximum file size: 20MB</li>
              </ul>
            </div>
            
            <div className="instruction-card">
              <h3>📝 Required Schema</h3>
              <div className="schema-info">
                <p><strong>Column Order:</strong></p>
                <code>name, slug, category, subcategory, shortDescription, description, specifications, sku, metaKeywords, metaTitle, metaDescription, status, featured, image, pdf</code>
              </div>
            </div>
            
            <div className="instruction-card">
              <h3>✅ Validation Rules</h3>
              <ul>
                <li><strong>name</strong> and <strong>category</strong> are mandatory</li>
                <li><strong>status</strong> must be "active" or "inactive"</li>
                <li><strong>featured</strong> must be "true" or "false"</li>
                <li><strong>subcategory</strong> should use text names only</li>
                <li>No empty columns allowed at the end</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Downloads */}
        <div className="sample-downloads">
          <h3>📥 Download Sample Templates</h3>
          <div className="download-buttons">
            <button onClick={downloadSampleCSV} className="btn btn-outline">
              📄 Download CSV Sample
            </button>
            <button onClick={downloadSampleExcel} className="btn btn-outline">
              📊 Download Excel Sample
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="export-section">
          <h3>📤 Export Products</h3>
          <p>Download all current products as a CSV file for backup or migration purposes.</p>
          <button onClick={exportProducts} className="btn btn-success">
            📤 Export All Products
          </button>
        </div>

        {/* File Upload Section */}
        <div className="upload-section">
          <h3>📤 Upload File</h3>
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="file-input"
            />
            
            {selectedFile ? (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button 
                  className="remove-file"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  <p>Drag & drop your file here</p>
                  <p>or <span className="browse-link">browse to select</span></p>
                </div>
                <div className="upload-formats">CSV, XLSX, XLS files only</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {uploadProgress < 100 ? 'Processing...' : 'Finalizing...'}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="upload-actions">
            <button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || serverStatus !== 'online'}
              className="btn btn-primary"
            >
              {isUploading ? '⏳ Uploading...' : 
               serverStatus !== 'online' ? '❌ Server Offline' : 
               '🚀 Start Import'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {uploadResult && (
          <div className="results-section">
            <h3>📊 Import Results</h3>
            <div className="results-summary">
              <div className="result-card success">
                <div className="result-number">{uploadResult.successful || 0}</div>
                <div className="result-label">Successful</div>
              </div>
              <div className="result-card error">
                <div className="result-number">{uploadResult.failed?.length || 0}</div>
                <div className="result-label">Failed</div>
              </div>
              <div className="result-card total">
                <div className="result-number">{uploadResult.total || 0}</div>
                <div className="result-label">Total</div>
              </div>
            </div>

            {uploadResult.failed && uploadResult.failed.length > 0 && (
              <div className="error-details">
                <h4>❌ Failed Rows</h4>
                <div className="error-list">
                  {uploadResult.failed.slice(0, 10).map((error, index) => (
                    <div key={index} className="error-item">
                      <span className="error-row">Row {error.rowNumber}:</span>
                      <span className="error-message">{error.error}</span>
                    </div>
                  ))}
                  {uploadResult.failed.length > 10 && (
                    <div className="error-more">
                      ... and {uploadResult.failed.length - 10} more errors
                    </div>
                  )}
                </div>
                <button onClick={downloadErrorReport} className="btn btn-outline">
                  📥 Download Error Report
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="error-section">
            <h3>❌ Errors</h3>
            <div className="error-list">
              {errors.map((error, index) => (
                <div key={index} className="error-item">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Import;
