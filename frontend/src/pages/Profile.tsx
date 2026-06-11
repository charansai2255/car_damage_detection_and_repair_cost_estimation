import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Car, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { getApiUrl, getAuthHeaders } from '../api';

const VEHICLE_CATALOG: Record<string, string[]> = {
  "HONDA": ["City", "Amaze", "WR-V", "Jazz", "HR-V", "Pilot", "CR-V", "Accord", "Civic"],
  "MARUTI SUZUKI": ["Swift", "Baleno", "Vitara Brezza", "Wagon R", "Ertiga", "Grand Vitara"],
  "TOYOTA": ["Corolla", "Camry", "Fortuner", "Innova", "Yaris"],
  "HYUNDAI": ["i20", "Creta", "Verna", "Venue", "Tucson"],
  "NISSAN": ["Altima", "Rogue", "Sentra", "Pathfinder", "Titan"],
  "SKODA": ["Octavia", "Superb", "Rapid", "Kodiaq", "Karoq"]
};

interface UserProfile {
  name: string;
  email: string;
  vehicleId: string;
  phoneNumber: string;
  address: string;
  carBrand: string;
  carModel: string;
}

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch(getApiUrl('/api/profile'), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        setEditData(data);
      } else {
        setError(data.error || 'Failed to retrieve profile data');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update models dropdown based on brand
  useEffect(() => {
    if (editData?.carBrand && VEHICLE_CATALOG[editData.carBrand]) {
      setModelsList(VEHICLE_CATALOG[editData.carBrand]);
    } else {
      setModelsList([]);
    }
  }, [editData?.carBrand]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editData) {
      setEditData(prev => {
        if (!prev) return null;
        const updated = { ...prev, [name]: value };
        // If brand changed, reset model
        if (name === 'carBrand') {
          updated.carModel = '';
        }
        return updated;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;

    const { name, email, vehicleId, phoneNumber, address, carBrand, carModel } = editData;

    if (!name || !email || !vehicleId || !phoneNumber || !address || !carBrand || !carModel) {
      setError('All fields are required');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(getApiUrl('/api/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(editData);
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        // Force refresh navbar authentication state
        window.dispatchEvent(new Event('storage'));
        
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        Loading profile information...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px', maxWidth: '680px', margin: '40px auto' }}>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '4px' }}>Owner Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
              Manage registered account details and vehicle settings
            </p>
          </div>

          {!isEditing && profile && (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ gap: '6px', padding: '8px 14px', fontSize: '13px' }}>
              <Edit2 size={13} />
              Edit Profile
            </button>
          )}
        </div>

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
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="glass-panel animate-fade-in" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--accent-emerald)',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        {isEditing && editData ? (
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={editData.name}
                  onChange={handleEditChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={editData.email}
                  onChange={handleEditChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Registration ID</label>
              <div style={{ position: 'relative' }}>
                <Car size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="vehicleId"
                  className="form-input"
                  value={editData.vehicleId}
                  onChange={handleEditChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-input"
                  maxLength={10}
                  value={editData.phoneNumber}
                  onChange={handleEditChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Car Brand</label>
              <div style={{ position: 'relative' }}>
                <Car size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  name="carBrand"
                  className="form-input form-select"
                  value={editData.carBrand}
                  onChange={handleEditChange}
                  style={{ paddingLeft: '38px' }}
                >
                  {Object.keys(VEHICLE_CATALOG).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Car Model</label>
              <div style={{ position: 'relative' }}>
                <Car size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  name="carModel"
                  className="form-input form-select"
                  value={editData.carModel}
                  onChange={handleEditChange}
                  style={{ paddingLeft: '38px' }}
                >
                  <option value="">Select Model</option>
                  {modelsList.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Residential Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={editData.address}
                  onChange={handleEditChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={() => { setIsEditing(false); setError(null); }} className="btn btn-secondary" style={{ flex: 1, gap: '6px' }}>
                <X size={15} />
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: '6px' }}>
                <Check size={15} />
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          profile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.08)', padding: '10px', borderRadius: '10px' }}>
                    <User size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Full Name</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.name}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.08)', padding: '10px', borderRadius: '10px' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Email Address</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.08)', padding: '10px', borderRadius: '10px' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Contact Number</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.phoneNumber}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--accent-pink)', background: 'rgba(236, 72, 153, 0.08)', padding: '10px', borderRadius: '10px' }}>
                    <Car size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Vehicle Registered</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {profile.carBrand} {profile.carModel} <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 400 }}>({profile.vehicleId})</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ color: 'var(--accent-orange)', background: 'rgba(245, 158, 11, 0.08)', padding: '10px', borderRadius: '10px' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Residential Address</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.address}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
