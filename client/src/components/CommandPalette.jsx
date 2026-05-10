import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, Calendar, Pill, Settings, LogOut, X, Bot, FileText, CreditCard, BarChart3, UserCircle } from 'lucide-react';
import { logout } from '../utils/auth';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });

  useEffect(() => {
    // Center initially
    setPos({ x: Math.max(10, window.innerWidth / 2 - 300), y: window.innerHeight / 4 });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isOpen]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initX: pos.x, initY: pos.y };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.initX + dx, y: dragRef.current.initY + dy });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  if (!isOpen) return null;

  const commands = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18}/>, action: () => { navigate('/dashboard'); setIsOpen(false); } },
    { name: 'Manage Patients', icon: <Users size={18}/>, action: () => { navigate('/patients'); setIsOpen(false); } },
    { name: 'View Appointments', icon: <Calendar size={18}/>, action: () => { navigate('/appointments'); setIsOpen(false); } },
    { name: 'Billing', icon: <CreditCard size={18}/>, action: () => { navigate('/billing'); setIsOpen(false); } },
    { name: 'Medical Records', icon: <FileText size={18}/>, action: () => { navigate('/medical-records'); setIsOpen(false); } },
    { name: 'Write Prescription', icon: <Pill size={18}/>, action: () => { navigate('/prescriptions'); setIsOpen(false); } },
    { name: 'Analytics', icon: <BarChart3 size={18}/>, action: () => { navigate('/analytics'); setIsOpen(false); } },
    { name: 'Clinical AI Assistant', icon: <Bot size={18}/>, action: () => { navigate('/ai-assistant'); setIsOpen(false); } },
    { name: 'System Settings', icon: <Settings size={18}/>, action: () => { navigate('/settings'); setIsOpen(false); } },
    { name: 'My Profile', icon: <UserCircle size={18}/>, action: () => { navigate('/profile'); setIsOpen(false); } },
    { name: 'Toggle Dark Mode', icon: <Search size={18}/>, action: () => { 
        const isDark = document.body.classList.contains('light-mode');
        if(isDark) { document.body.classList.remove('light-mode'); localStorage.setItem('theme', 'dark'); }
        else { document.body.classList.add('light-mode'); localStorage.setItem('theme', 'light'); }
        setIsOpen(false);
    } },
    { name: 'Sign Out', icon: <LogOut size={18}/>, action: () => { logout(); navigate('/login'); setIsOpen(false); } },
  ];

  const filtered = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{
      position: 'fixed',
      top: pos.y,
      left: pos.x,
      width: '600px',
      maxWidth: '90vw',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(24px)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      resize: 'both',
      overflow: 'hidden',
      minWidth: '300px',
      minHeight: '200px',
      maxHeight: '80vh'
    }}>
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}
      >
        <Search size={20} color="var(--primary)" />
        <input 
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search commands... (Movable & Resizable)"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text-0)',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-body)',
            pointerEvents: 'auto'
          }}
          onPointerDown={e => e.stopPropagation()}
        />
        <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', background: 'var(--bg-1)', padding: '0.2rem 0.5rem', borderRadius: 4, marginRight: '0.5rem', pointerEvents: 'none' }}>
          ESC to close
        </div>
        <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => setIsOpen(false)} onPointerDown={e => e.stopPropagation()}>
          <X size={18} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', padding: '0.75rem', flex: 1 }}>
        {filtered.length > 0 ? filtered.map((cmd, idx) => (
          <button
            key={idx}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '0.75rem 1rem',
              marginBottom: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-0)'
            }}
            onClick={cmd.action}
          >
            {cmd.icon} {cmd.name}
          </button>
        )) : (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-2)' }}>
            No commands found matching "{query}"
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPalette;
