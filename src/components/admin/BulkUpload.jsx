import React, { useState } from "react";
import {
  Card,
  Button,
  Form,
  Alert,
  ProgressBar,
  Table,
  Badge,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  bulkUploadProducts,
  downloadTemplate,
} from "../../redux/slices/productSlice";
import toast from "react-hot-toast";
import "../../styles/components/BulkUpload.css";

const BulkUpload = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const ext = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(ext)) {
        toast.error("Please upload an Excel or CSV file");
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setResults(null);
      setErrors([]);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(10);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await dispatch(bulkUploadProducts(formData)).unwrap();

      setProgress(100);

      // Handle the result properly
      if (result && typeof result === "object") {
        // Check if it's an error object
        if (result.message && !result.success && !result.data) {
          setUploadError(result.message || "Upload failed");
          toast.error(result.message || "Upload failed");
          setResults(null);
        } else {
          const data = result.data || result;
          setResults(data);
          setErrors(data.errors || []);

          if (data.success > 0) {
            toast.success(`${data.success} products uploaded successfully!`);
          }
          if (data.failed > 0) {
            // ✅ Use toast.error instead of toast.warning
            toast.error(
              `${data.failed} products failed to upload. Check errors below.`,
            );
          }
          if (data.success === 0 && data.failed === 0) {
            toast.custom("No products were processed.", {
              icon: "ℹ️",
              style: {
                background: "#1a1a1a",
                color: "#ffffff",
                border: "1px solid #3b82f6",
              },
            });
          }
        }
      } else {
        toast.success("Upload completed successfully!");
        setResults({ success: 0, failed: 0, total: 0, errors: [] });
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMsg = "Failed to upload products";
      if (typeof error === "string") {
        errorMsg = error;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.error?.message) {
        errorMsg = error.error.message;
      }
      setUploadError(errorMsg);
      toast.error(errorMsg);
      setProgress(0);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 3000);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const result = await dispatch(downloadTemplate()).unwrap();
      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      let errorMsg = "Failed to download template";
      if (typeof error === "string") {
        errorMsg = error;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setResults(null);
    setErrors([]);
    setUploadError(null);
    document.getElementById("fileInput").value = "";
  };

  // Helper to safely render results
  const getResultValue = (value, fallback = 0) => {
    if (value === undefined || value === null || isNaN(value)) {
      return fallback;
    }
    return value;
  };

  return (
    <div className="bulk-upload-container">
      <Card className="bulk-upload-card">
        <Card.Header className="bulk-upload-header">
          <div className="d-flex align-items-center gap-2">
            <FileSpreadsheet size={24} color="#8B0000" />
            <h5 className="mb-0">Bulk Product Upload</h5>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleDownloadTemplate}
            className="template-btn"
          >
            <Download size={16} />
            Download Template
          </Button>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="info-alert">
            <strong>How it works:</strong>
            <ol className="mb-0 mt-2">
              <li>Download the template file</li>
              <li>Fill in your product data in the Excel/CSV file</li>
              <li>Upload the file and click "Upload Products"</li>
              <li>Products will be automatically added to your catalog</li>
            </ol>
          </Alert>

          {uploadError && (
            <Alert variant="danger" className="mt-3">
              <strong>Error:</strong> {uploadError}
            </Alert>
          )}

          <div className="upload-area">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="file-input"
              disabled={uploading}
            />
            <label htmlFor="fileInput" className="file-label">
              {file ? (
                <div className="file-selected">
                  <FileSpreadsheet size={32} />
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    className="clear-file"
                    onClick={handleClearFile}
                    disabled={uploading}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="file-placeholder">
                  <Upload size={40} color="#6B7280" />
                  <p>Click or drag to upload Excel/CSV file</p>
                  <small>Supports .xlsx, .xls, .csv</small>
                </div>
              )}
            </label>
          </div>

          {uploading && (
            <div className="progress-container">
              <ProgressBar
                now={progress}
                label={`${progress}%`}
                variant="danger"
                animated
                className="upload-progress"
              />
              <span className="upload-status">Uploading products...</span>
            </div>
          )}

          <div className="upload-actions">
            <Button
              variant="danger"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="upload-btn"
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} className="me-2" />
                  Upload Products
                </>
              )}
            </Button>
          </div>

          {/* Results - Only render if results exist and is a valid object */}
          {results && typeof results === "object" && !results.message && (
            <div className="results-container">
              <div className="results-summary">
                <div className="result-item success">
                  <Check size={20} />
                  <span>{getResultValue(results.success)} Success</span>
                </div>
                <div className="result-item failed">
                  <AlertCircle size={20} />
                  <span>{getResultValue(results.failed)} Failed</span>
                </div>
                <div className="result-item total">
                  <span>
                    Total:{" "}
                    {getResultValue(
                      results.total,
                      getResultValue(results.success) +
                        getResultValue(results.failed),
                    )}
                  </span>
                </div>
              </div>

              {errors && errors.length > 0 && (
                <div className="errors-container">
                  <h6>Errors:</h6>
                  <div className="table-responsive">
                    <Table size="sm" className="errors-table">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Error</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errors.map((error, index) => (
                          <tr key={index}>
                            <td>{error.row || index + 1}</td>
                            <td className="text-danger">
                              {error.error || "Unknown error"}
                            </td>
                            <td>
                              <pre className="error-data">
                                {typeof error.data === "object"
                                  ? JSON.stringify(error.data, null, 2)
                                  : error.data || "N/A"}
                              </pre>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Sample Data Preview */}
      <Card className="sample-data-card mt-3">
        <Card.Header className="sample-data-header">
          <h6 className="mb-0">📋 Sample Data Format</h6>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table size="sm" className="sample-table">
              <thead>
                <tr>
                  <th>Name *</th>
                  <th>Brand *</th>
                  <th>Category *</th>
                  <th>Description *</th>
                  <th>Sizes</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chanel No. 5</td>
                  <td>Chanel</td>
                  <td>women</td>
                  <td>A timeless classic fragrance...</td>
                  <td>50ml:15000:50:18000:20</td>
                  <td>15000</td>
                  <td>Yes</td>
                  <td>active</td>
                </tr>
                <tr>
                  <td>Dior Sauvage</td>
                  <td>Dior</td>
                  <td>men</td>
                  <td>Fresh and bold fragrance...</td>
                  <td>100ml:25000:30:30000:17</td>
                  <td>25000</td>
                  <td>Yes</td>
                  <td>active</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <small className="text-muted">
            Download the full template for all available fields
          </small>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BulkUpload;
