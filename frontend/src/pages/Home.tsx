import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Cpu, Hammer, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 20px 60px 20px',
        position: 'relative'
      }}>
        <div className="glass-panel animate-float" style={{
          padding: '8px 16px',
          borderRadius: '30px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#c084fc',
          border: '1px solid rgba(192, 132, 252, 0.25)',
          marginBottom: '24px',
          background: 'rgba(139, 92, 246, 0.05)'
        }}>
          <Sparkles size={14} />
          <span>Next-Generation Object Detection AI</span>
        </div>

        <h1 style={{
          fontSize: '64px',
          lineHeight: '1.1',
          marginBottom: '24px',
          maxWidth: '850px',
          fontWeight: 800
        }}>
          Instant Vehicle Damage <br />
          <span className="text-gradient">Detection & Estimation</span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '18px',
          maxWidth: '650px',
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          Streamline insurance evaluations and repair estimations. Upload an image, run our high-accuracy YOLOv8 AI model, and get an immediate cost analysis tailored to your car's brand and model.
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          {token ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Go to Dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                Get Started
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Highlights Grid */}
      <section style={{
        padding: '60px 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        margin: '40px 0'
      }}>
        {/* Card 1 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '32px', textAlign: 'left' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)',
            marginBottom: '24px'
          }}>
            <Cpu size={24} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>AI-Powered YOLOv8</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
            Utilizes state-of-the-art computer vision algorithms trained specifically on damaged automotive components to highlight scratches, dents, and fractures in real-time.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '32px', textAlign: 'left' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)',
            marginBottom: '24px'
          }}>
            <Hammer size={24} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Intelligent Estimations</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
            Maps detected parts directly to manufacturer-grade pricing schemas using database calculations matching your specific car brand and model.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '32px', textAlign: 'left' }}>
          <div style={{
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-pink)',
            marginBottom: '24px'
          }}>
            <Shield size={24} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Insurance Ready</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
            Generates precise breakdown figures, providing vehicle owners, insurers, and repair centers with the transparency needed to expedite repair workflows.
          </p>
        </div>
      </section>

      {/* Dynamic Process Section */}
      <section style={{
        padding: '60px 40px',
        margin: '60px 0',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }} className="glass-panel">
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>How It Works</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 48px auto' }}>
          Scan vehicle damage and receive cost analyses in three simple steps.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          position: 'relative'
        }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-primary))',
              border: '1px solid var(--border-glass)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--accent-blue)',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.1)',
              marginBottom: '20px'
            }}>
              1
            </div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Create Profile</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', maxWidth: '200px' }}>
              Sign up and register your car's manufacturer brand and model details.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-primary))',
              border: '1px solid var(--border-glass)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--accent-purple)',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.1)',
              marginBottom: '20px'
            }}>
              2
            </div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Upload & Detect</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', maxWidth: '200px' }}>
              Upload an image of the damage and watch our YOLOv8 AI detect affected parts.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-primary))',
              border: '1px solid var(--border-glass)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--accent-pink)',
              boxShadow: '0 0 15px rgba(236, 72, 153, 0.1)',
              marginBottom: '20px'
            }}>
              3
            </div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Get Cost Estimate</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', maxWidth: '200px' }}>
              Instantly view a granular price breakdown and overall estimated repair cost.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
