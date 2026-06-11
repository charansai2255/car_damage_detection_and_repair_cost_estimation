import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Car, Phone, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { getApiUrl } from '../api';

const VEHICLE_CATALOG: Record<string, string[]> = {
  "HONDA": ["City", "Amaze", "WR-V", "Jazz", "HR-V", "Pilot", "CR-V", "Accord", "Civic"],
  "MARUTI SUZUKI": ["Swift", "Baleno", "Vitara Brezza", "Wagon R", "Ertiga", "Grand Vitara"],
  "TOYOTA": ["Corolla", "Camry", "Fortuner", "Innova", "Yaris"],
  "HYUNDAI": ["i20", "Creta", "Verna", "Venue", "Tucson"],
  "NISSAN": ["Altima", "Rogue", "Sentra", "Pathfinder", "Titan"],
  "SKODA": ["Octavia", "Superb", "Rapid", "Kodiaq", "Karoq"]
};

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    vehicleId: '',
    phoneNumber: '',
    address: '',
    carBrand: '',
    carModel: ''
  });
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dynamic model populator
  useEffect(() => {
    if (formData.carBrand && VEHICLE_CATALOG[formData.carBrand]) {
      setModelsList(VEHICLE_CATALOG[formData.carBrand]);
      // Reset selected model when brand changes
      setFormData(prev => ({ ...prev, carModel: '' }));
    } else {
      setModelsList([]);
    }
  }, [formData.carBrand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, vehicleId, phoneNumber, address, carBrand, carModel } = formData;

    if (!name || !email || !password || !vehicleId || !phoneNumber || !address || !carBrand || !carModel) {
      setError('All fields are required');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('/api/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
        // Force refresh navbar authentication state
        window.dispatchEvent(new Event('storage'));
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('Database connection failed or API is offline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '40px 20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '40px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--glow-blue), var(--glow-purple))',
          position: 'absolute',
          top: '-1px',
          left: '50%',
          transform: 'translateX(-50%)',
          height: '2px',
          width: '80px',
          borderRadius: '2px'
        }}></div>

        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Register your details and car model to calculate damage repair prices
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
            fontSize: '13.5px',
            textAlign: 'left',
            marginBottom: '24px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
          {/* Column 1 */}
          <div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="9876543210"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <div className="form-group">
              <label className="form-label">Vehicle Registration ID</label>
              <div style={{ position: 'relative' }}>
                <Sparkles size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="vehicleId"
                  className="form-input"
                  placeholder="MH12AB1234"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Car Brand</label>
              <div style={{ position: 'relative' }}>
                <Car size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  name="carBrand"
                  className="form-input form-select"
                  value={formData.carBrand}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                >
                  <option value="">Select Brand</option>
                  {Object.keys(VEHICLE_CATALOG).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Car Model</label>
              <div style={{ position: 'relative' }}>
                <Car size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  name="carModel"
                  className="form-input form-select"
                  value={formData.carModel}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={!formData.carBrand || loading}
                >
                  <option value="">Select Model</option>
                  {modelsList.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="Street, City"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </div>
        </form>

        <p style={{ marginTop: '24px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
