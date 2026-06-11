import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, IndianRupee, Download, Image as ImageIcon, FileText, Loader2, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getApiUrl, getAuthHeaders } from '../api';
import { generateDamageReport } from '../utils/generatePDF';

interface PartEstimate {
  count: number;
  price: number;
  total: number;
}

interface EstimateResponse {
  originalImage: string;
  detectedImage: string;
  partPrices: Record<string, PartEstimate>;
}

interface UserProfile {
  name: string;
  email: string;
  vehicleId: string;
  carBrand: string;
  carModel: string;
}

export const Estimate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const estimateData = location.state?.estimateData as EstimateResponse | undefined;
  const detectedAt   = location.state?.detectedAt as string | undefined;

  useEffect(() => {
    if (!estimateData) {
      navigate('/dashboard');
      return;
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899']
    });

    // Fetch user profile for the PDF
    fetch(getApiUrl('/api/profile'), { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setUserProfile({
        name: d.name,
        email: d.email,
        vehicleId: d.vehicleId,
        carBrand: d.carBrand,
        carModel: d.carModel,
      }))
      .catch(() => {});
  }, [estimateData, navigate]);

  if (!estimateData) return null;

  const { originalImage, detectedImage, partPrices } = estimateData;

  const totalQuantity = Object.values(partPrices).reduce((sum, item) => sum + item.count, 0);
  const totalCost     = Object.values(partPrices).reduce((sum, item) => sum + item.total, 0);

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = getApiUrl(detectedImage);
    link.download = 'detected_damage.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      await generateDamageReport({
        originalImage,
        detectedImage,
        partPrices,
        userName:     userProfile?.name,
        vehicleBrand: userProfile?.carBrand,
        vehicleModel: userProfile?.carModel,
        vehicleId:    userProfile?.vehicleId,
        detectedAt,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px', maxWidth: '1200px', margin: '40px auto' }}>
      {/* Back to dashboard */}
      <Link to="/dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '24px',
        transition: 'color 0.2s'
      }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
         onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Top: Side-by-side Comparison Section */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Visual Scan Comparison
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Compare original uploaded photo with AI model detected damage areas.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDownloadImage}
                className="btn btn-secondary"
                style={{ fontSize: '13.5px', gap: '8px', padding: '10px 18px' }}
              >
                <Download size={14} />
                Download Scan
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="btn btn-primary"
                style={{ fontSize: '13.5px', gap: '8px', padding: '10px 18px', opacity: generatingPDF ? 0.7 : 1 }}
              >
                {generatingPDF
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
                  : <><FileText size={14} /> Download PDF Report</>
                }
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {/* Original Image */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Original Photo
              </span>
              <div style={{
                width: '100%',
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.3s'
              }}>
                <img
                  src={getApiUrl(originalImage)}
                  alt="Original Car View"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Scanned Image */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)' }}></span>
                AI Scan Output
              </span>
              <div style={{
                width: '100%',
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.3s'
              }}>
                <img
                  src={getApiUrl(detectedImage)}
                  alt="Detected Damage View"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Cost overview & Table breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}>
          
          {/* Left: Overall stats & Vehicle info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Total Cost Summary Card */}
            <div className="glass-panel" style={{
              padding: '32px',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 70%), var(--bg-glass)'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <CheckCircle2 size={14} />
                  Detection Complete
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Estimated Repair Cost
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)' }} className="text-gradient-emerald">
                    ₹{totalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)'
              }}>
                <IndianRupee size={30} />
              </div>
            </div>

            {/* Vehicle Profile Summary Card */}
            {userProfile && (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} color="var(--accent-purple)" />
                  Vehicle & Owner Profile
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Owner Name</span>
                    <p style={{ fontSize: '14.5px', fontWeight: 600, margin: '2px 0 0 0' }}>{userProfile.name}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email Address</span>
                    <p style={{ fontSize: '14.5px', fontWeight: 600, margin: '2px 0 0 0', wordBreak: 'break-all' }}>{userProfile.email}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Car Brand & Model</span>
                    <p style={{ fontSize: '14.5px', fontWeight: 600, margin: '2px 0 0 0' }}>{userProfile.carBrand} {userProfile.carModel}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vehicle ID</span>
                    <p style={{ fontSize: '14.5px', fontWeight: 600, margin: '2px 0 0 0' }}>{userProfile.vehicleId}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Detailed Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Repair Price Breakdown</h3>

            {Object.keys(partPrices).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <ImageIcon size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px' }}>No damaged parts detected by the AI model.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Damaged Part</th>
                      <th style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Count</th>
                      <th style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Price/Unit</th>
                      <th style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(partPrices).map(([partName, details]) => (
                      <tr key={partName} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '14px 8px', fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{partName}</td>
                        <td style={{ padding: '14px 8px', fontSize: '14.5px', color: 'var(--text-secondary)', textAlign: 'center' }}>{details.count}</td>
                        <td style={{ padding: '14px 8px', fontSize: '14.5px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                          {details.price > 0 ? `₹${details.price.toLocaleString('en-IN')}` : 'N/A'}
                        </td>
                        <td style={{ padding: '14px 8px', fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>
                          {details.total > 0 ? `₹${details.total.toLocaleString('en-IN')}` : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 700 }}>
                      <td style={{ padding: '18px 8px 12px 8px', fontSize: '15px' }}>Total Parts</td>
                      <td style={{ padding: '18px 8px 12px 8px', fontSize: '15px', textAlign: 'center' }}>{totalQuantity}</td>
                      <td></td>
                      <td style={{ padding: '18px 8px 12px 8px', fontSize: '16px', color: 'var(--accent-emerald)', textAlign: 'right' }}>
                        ₹{totalCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
