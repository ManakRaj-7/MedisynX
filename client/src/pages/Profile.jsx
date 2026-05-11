import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '../api/api';
import { getToken, setUser } from '../utils/auth';
import { 
  User, Mail, Phone, Award, Building, FileText, 
  Shield, CheckCircle, Save, Camera, 
  Cpu, MessageSquare, Info, Clock, Lock
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Default avatars using DiceBear
  const defaultAvatars = [
    'doctor-1', 'doctor-2', 'doctor-3', 'doctor-4', 'doctor-5',
    'doctor-6', 'doctor-7', 'doctor-8', 'doctor-9', 'doctor-10'
  ].map(id => ({
    id,
    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}&backgroundColor=b6e3f4,c0aede,d1d4f9`
  }));

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = getToken();
        const data = await apiGet('/auth/me', token);
        if (data._id) {
          setProfile(data);
        }
      } catch (err) {
        setMessage({ text: 'Failed to load profile.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: { ...profile[parent], [child]: type === 'checkbox' ? checked : value }
      });
    } else {
      setProfile({ ...profile, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleAvatarSelect = (avatarId) => {
    setProfile({ ...profile, avatarId, profileImage: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const token = getToken();
      const updated = await apiPut('/auth/me', profile, token);
      if (updated._id) {
        setProfile(updated);
        setUser(updated); // Update local storage
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setMessage({ text: updated.message || 'Update failed.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Operation failed.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '80vh' }}></div>;

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={18} /> },
    { id: 'professional', label: 'Professional', icon: <Award size={18} /> },
    { id: 'ai', label: 'AI Preferences', icon: <Cpu size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Doctor Profile</h1>
        <p>Manage your professional identity and system preferences.</p>
      </div>

      {message.text && <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>{message.text}</div>}

      <div className="layout-2col profile-grid">
        {/* Sidebar */}
        <div className="card" style={{ padding: '1rem', position: 'sticky', top: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
            <div className="sidebar-user-avatar" style={{ width: 80, height: 80, margin: '0 auto 1rem', fontSize: '1.5rem' }}>
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : profile.avatarId ? (
                <img src={defaultAvatars.find(a => a.id === profile.avatarId)?.url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                profile.name?.charAt(0) || 'D'
              )}
            </div>
            <h3 style={{ marginBottom: '0.25rem' }}>{profile.name}</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{profile.specialization}</p>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {activeTab === 'personal' && (
              <div className="form-grid">
                <div className="card-header">
                  <h2><User size={20} /> Basic Information</h2>
                </div>
                
                <div className="input-group">
                  <label>Avatar Preference</label>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="sidebar-user-avatar" style={{ width: 100, height: 100, fontSize: '2rem', position: 'relative' }}>
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                      ) : profile.avatarId ? (
                        <img src={defaultAvatars.find(a => a.id === profile.avatarId)?.url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                      ) : (
                        profile.name?.charAt(0) || 'D'
                      )}
                      <label 
                        className="btn btn-primary" 
                        style={{ 
                          position: 'absolute', bottom: -5, right: -5, 
                          width: 32, height: 32, padding: 0, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Camera size={16} />
                        <input 
                          type="file" 
                          hidden 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            const formData = new FormData();
                            formData.append('avatar', file);
                            
                            setMessage({ text: 'Uploading and compressing...', type: 'info' });
                            try {
                              const token = getToken();
                              const response = await fetch('http://localhost:5000/api/v1/auth/me/avatar', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: formData
                              });
                              const data = await response.json();
                              if (data._id) {
                                setProfile(data);
                                setUser(data);
                                setMessage({ text: 'Photo uploaded!', type: 'success' });
                              }
                            } catch {
                              setMessage({ text: 'Upload failed.', type: 'error' });
                            }
                          }} 
                        />
                      </label>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: '0.25rem' }}>Upload Photo</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                        Pick a professional avatar or upload your own. 
                        Images are automatically compressed to save space.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    {defaultAvatars.map(av => (
                      <div 
                        key={av.id} 
                        onClick={() => handleAvatarSelect(av.id)}
                        style={{ 
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '50%',
                          border: profile.avatarId === av.id ? '2px solid var(--primary)' : '2px solid transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={av.url} alt={av.id} style={{ width: '100%', borderRadius: '50%' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="layout-2col-equal">
                  <div className="input-group">
                    <label>Full Name</label>
                    <div className="input-wrapper"><User size={18} /><input name="name" value={profile.name} onChange={handleChange} required /></div>
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <div className="input-wrapper"><Mail size={18} /><input value={profile.email} disabled style={{ opacity: 0.6 }} /></div>
                  </div>
                </div>

                <div className="layout-2col-equal">
                  <div className="input-group">
                    <label>Specialization</label>
                    <div className="input-wrapper"><Award size={18} /><input name="specialization" value={profile.specialization} onChange={handleChange} required /></div>
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper"><Phone size={18} /><input name="phone" value={profile.phone || ''} onChange={handleChange} placeholder="+91 XXXXX XXXXX" /></div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Brief Bio</label>
                  <div className="input-wrapper"><textarea name="bio" value={profile.bio || ''} onChange={handleChange} placeholder="Tell us about your medical expertise..." /></div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="form-grid">
                <div className="card-header">
                  <h2><Award size={20} /> Professional Details</h2>
                </div>

                <div className="layout-2col-equal">
                  <div className="input-group">
                    <label>Medical License ID</label>
                    <div className="input-wrapper"><FileText size={18} /><input name="licenseNumber" value={profile.licenseNumber || ''} onChange={handleChange} placeholder="MC-12345" /></div>
                  </div>
                  <div className="input-group">
                    <label>Qualification</label>
                    <div className="input-wrapper"><Award size={18} /><input name="qualification" value={profile.qualification || ''} onChange={handleChange} placeholder="MBBS, MD" /></div>
                  </div>
                </div>

                <div className="layout-2col-equal">
                  <div className="input-group">
                    <label>Hospital/Clinic</label>
                    <div className="input-wrapper"><Building size={18} /><input name="hospital" value={profile.hospital || ''} onChange={handleChange} placeholder="City Heart Clinic" /></div>
                  </div>
                  <div className="input-group">
                    <label>Experience (Years)</label>
                    <div className="input-wrapper"><input name="experience" type="number" value={profile.experience || 0} onChange={handleChange} /></div>
                  </div>
                </div>

                <div className="layout-2col-equal">
                  <div className="input-group">
                    <label>Consultation Fee (₹)</label>
                    <div className="input-wrapper"><input name="consultationFee" type="number" value={profile.consultationFee || 0} onChange={handleChange} /></div>
                  </div>
                  <div className="input-group">
                    <label>Availability</label>
                    <div className="input-wrapper"><Clock size={18} /><input name="availability" value={profile.availability || ''} onChange={handleChange} placeholder="Mon-Fri, 9AM-5PM" /></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="form-grid">
                <div className="card-header">
                  <h2><Cpu size={20} /> AI Preferences</h2>
                  <span className="badge badge-info">MedisynX AI Engine</span>
                </div>

                <div className="input-group">
                  <label>AI Model</label>
                  <div className="input-wrapper">
                    <Cpu size={18} />
                    <select name="aiPreferences.model" value={profile.aiPreferences?.model} onChange={handleChange}>
                      <option value="smart-fallback">Smart Fallback (OpenRouter + Gemini)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Direct)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Research Level)</option>
                    </select>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>Smart Fallback uses free OpenRouter models first to save usage.</p>
                </div>

                <div className="input-group">
                  <label>Response Style</label>
                  <div className="input-wrapper">
                    <MessageSquare size={18} />
                    <select name="aiPreferences.responseStyle" value={profile.aiPreferences?.responseStyle} onChange={handleChange}>
                      <option value="concise">Concise (Bullet points)</option>
                      <option value="detailed">Detailed (In-depth analysis)</option>
                      <option value="research">Research-oriented (With citations)</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>AI Confidence Threshold: {Math.round(profile.aiPreferences?.confidenceThreshold * 100)}%</label>
                  <input 
                    name="aiPreferences.confidenceThreshold" 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.1" 
                    value={profile.aiPreferences?.confidenceThreshold || 0.6} 
                    onChange={handleChange}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-2)' }}>
                    <span>Strict (High Conf)</span>
                    <span>Relaxed</span>
                  </div>
                </div>

                <div className="card" style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--primary)', padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Auto-generate Prescriptions</h4>
                      <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Enable AI to suggest medicines based on diagnosis.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        name="aiPreferences.autoGeneratePrescription" 
                        checked={profile.aiPreferences?.autoGeneratePrescription} 
                        onChange={handleChange} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="form-grid">
                <div className="card-header">
                  <h2><Shield size={20} /> Security & Privacy</h2>
                  <div className="badge badge-success"><CheckCircle size={12} /> Verified Account</div>
                </div>
                
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label>Current Password</label>
                    <div className="input-wrapper">
                      <Shield size={18} />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        id="currentPassword"
                        required 
                      />
                    </div>
                  </div>

                  <div className="layout-2col-equal">
                    <div className="input-group">
                      <label>New Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} />
                        <input 
                          type="password" 
                          placeholder="New password" 
                          id="newPassword"
                          required 
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Confirm New Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} />
                        <input 
                          type="password" 
                          placeholder="Confirm new password" 
                          id="confirmPassword"
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ justifyContent: 'center' }}
                    onClick={async () => {
                      const currentPassword = document.getElementById('currentPassword').value;
                      const newPassword = document.getElementById('newPassword').value;
                      const confirmPassword = document.getElementById('confirmPassword').value;

                      if (!currentPassword || !newPassword) {
                        setMessage({ text: 'Please fill in all password fields.', type: 'error' });
                        return;
                      }

                      if (newPassword !== confirmPassword) {
                        setMessage({ text: 'New passwords do not match.', type: 'error' });
                        return;
                      }

                      setIsSaving(true);
                      try {
                        const token = getToken();
                        const response = await fetch('http://localhost:5000/api/v1/auth/change-password', {
                          method: 'PUT',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                          },
                          body: JSON.stringify({ currentPassword, newPassword })
                        });
                        const data = await response.json();
                        if (response.ok) {
                          setMessage({ text: 'Password changed successfully!', type: 'success' });
                          document.getElementById('currentPassword').value = '';
                          document.getElementById('newPassword').value = '';
                          document.getElementById('confirmPassword').value = '';
                        } else {
                          setMessage({ text: data.message || 'Change failed.', type: 'error' });
                        }
                      } catch {
                        setMessage({ text: 'Server error.', type: 'error' });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    Update Password
                  </button>
                </div>

                <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                    <Info size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: '0.5rem' }}>Data Privacy & Account Info</h4>
                      <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-2)' }}>Member Since:</span>
                          <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-2)' }}>Account Status:</span>
                          <span style={{ color: 'var(--success)' }}>Active (Verified)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-2)' }}>Login Session:</span>
                          <span>7 Days (Active)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : <><Save size={18} /> Save All Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
