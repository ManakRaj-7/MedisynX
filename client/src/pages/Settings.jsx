import { Settings as SettingsIcon, Shield, Bell, Key, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="stat-card-icon" style={{ width: 48, height: 48, background: 'var(--bg-2)', color: 'var(--text-1)' }}><SettingsIcon size={28} /></div>
          <div>
            <h1 style={{ marginBottom: 0 }}>System Settings</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 2 }}>Manage preferences and security configurations.</p>
          </div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Shield size={20} /> Security & Privacy
          </h3>
          <div className="form-grid">
             <div className="input-group">
                <label>HIPAA Compliance Mode</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" id="hipaa" defaultChecked style={{ width: 20, height: 20 }} />
                  <label htmlFor="hipaa" style={{ margin: 0, fontWeight: 500 }}>Enforce strict data obfuscation in logs</label>
                </div>
             </div>
             <div className="input-group" style={{ marginTop: '1rem' }}>
                <label>Two-Factor Authentication (2FA)</label>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>Enable 2FA</button>
             </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <SettingsIcon size={20} /> Appearance & Alerts
          </h3>
          <div className="form-grid">
             <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Dark Mode</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Switch between light and dark themes.</div>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="btn btn-ghost"
                  style={{ width: 48, height: 48, borderRadius: '50%' }}
                >
                  {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>
             </div>

             <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Push Notifications</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Receive alerts for new appointments.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={(e) => setNotifications(e.target.checked)} 
                  style={{ width: 24, height: 24 }} 
                />
             </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
           <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Key size={20} /> API Integrations
          </h3>
          <div className="input-group" style={{ maxWidth: 600 }}>
             <label>Custom Gemini API Key (Optional Override)</label>
             <div className="input-wrapper">
               <input type="password" placeholder="sk-..." />
             </div>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.5rem' }}>
               Leave blank to use the server's default configuration.
             </p>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Settings</button>
        </div>
      </div>
    </>
  );
};

export default Settings;
