import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileImage, ShieldAlert, Sparkles, Wand2, Clock, ChevronRight, Car, IndianRupee } from 'lucide-react';
import { getApiUrl, getAuthHeaders } from '../api';

interface PartPrice {
  count: number;
  price: number;
  total: number;
}

interface UploadRecord {
  id: number;
  uploadedImage: string;
  detectedImage: string;
  partPrices: Record<string, PartPrice>;
  totalCost: number;
  detectedAt: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<UploadRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchRecentUploads = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(getApiUrl('/api/uploads'), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setRecentUploads(data.uploads || []);
      }
    } catch (err) {
      console.error('Failed to fetch upload history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentUploads();
  }, [fetchRecentUploads]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, or JPEG)');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => {
    setDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(getApiUrl('/api/detect'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          navigate('/estimate', { state: { estimateData: data, detectedAt: new Date().toISOString() } });
        }, 2500);
      } else {
        setAnalyzing(false);
        setError(data.error || 'Failed to analyze vehicle damage');
      }
    } catch (err) {
      console.error(err);
      setAnalyzing(false);
      setError('Connection to backend failed. Verify the API server is active.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const viewEstimate = (upload: UploadRecord) => {
    navigate('/estimate', {
      state: {
        estimateData: {
          originalImage: upload.uploadedImage,
          detectedImage: upload.detectedImage,
          partPrices: upload.partPrices,
        },
        detectedAt: upload.detectedAt,
      }
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px', maxWidth: '900px', margin: '40px auto' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>Damage Assessment Panel</h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px' }}>
        Upload a high-resolution photo of the vehicle accident area
      </p>

      {error && (
        <div className="glass-panel animate-fade-in" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#ef4444',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {/* Holographic scanner effect container */}
        {analyzing && previewUrl && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            borderRadius: '16px',
            background: 'rgba(8, 9, 13, 0.7)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '360px',
              height: '240px',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)'
            }}>
              <img src={previewUrl} alt="Scanning preview" style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.5
              }} />
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #c084fc, #ec4899, #c084fc, transparent)',
                boxShadow: '0 0 15px 4px rgba(139, 92, 246, 0.8), 0 0 30px 8px rgba(236, 72, 153, 0.6)',
                animation: 'scanLine 2s infinite linear'
              }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c084fc', fontWeight: 600 }}>
              <Wand2 className="animate-float" size={18} />
              <span>Analyzing parts damage via YOLOv8 model...</span>
            </div>
          </div>
        )}

        {!previewUrl ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={triggerFileInput}
            className="glass-panel"
            style={{
              padding: '60px 40px',
              borderRadius: '16px',
              border: dragging ? '2px dashed var(--accent-purple)' : '1px dashed var(--border-glass)',
              background: dragging ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-glass)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              style={{ display: 'none' }}
              accept="image/*"
            />
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Upload size={24} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                Drag and drop your image here, or <span style={{ color: 'var(--accent-purple)' }}>browse</span>
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Supports PNG, JPG, or JPEG
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-panel animate-fade-in" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{
              width: '100%',
              maxHeight: '400px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <img
                src={previewUrl}
                alt="Selected car preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileImage size={18} color="var(--accent-blue)" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {selectedFile?.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ({(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={clearSelection}
                  className="btn btn-secondary"
                  disabled={analyzing}
                >
                  Clear
                </button>
                <button
                  onClick={handleUpload}
                  className="btn btn-primary"
                  style={{ gap: '8px' }}
                  disabled={analyzing}
                >
                  <Sparkles size={16} />
                  Analyze Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Uploads Section ─────────────────────────────────────── */}
      <div style={{ marginTop: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Clock size={18} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Recent Uploads</h3>
        </div>

        {loadingHistory ? (
          <div className="glass-panel" style={{
            padding: '32px',
            borderRadius: '14px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '2px solid var(--accent-purple)',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }} />
            Loading history...
          </div>
        ) : recentUploads.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '40px',
            borderRadius: '14px',
            textAlign: 'center',
          }}>
            <Car size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No uploads yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Your detection history will appear here after your first analysis.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentUploads.map((upload) => {
              const partsList = Object.keys(upload.partPrices);
              return (
                <div
                  key={upload.id}
                  className="glass-panel"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--border-glass)',
                  }}
                  onClick={() => viewEstimate(upload)}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '72px',
                    height: '56px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(0,0,0,0.3)',
                  }}>
                    <img
                      src={getApiUrl(upload.detectedImage)}
                      alt="Detected"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                      {partsList.length > 0
                        ? partsList.join(', ')
                        : 'No damage detected'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(upload.detectedAt)}
                    </p>
                  </div>

                  {/* Cost badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    background: 'rgba(139, 92, 246, 0.12)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    color: '#c084fc',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}>
                    <IndianRupee size={13} />
                    {upload.totalCost.toLocaleString('en-IN')}
                  </div>

                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
