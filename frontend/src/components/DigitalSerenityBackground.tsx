import { useState, useEffect, useRef } from 'react';

interface Ripple { id: number; x: number; y: number; }

interface DigitalSerenityBackgroundProps {
  theme?: string;
}

export default function DigitalSerenityBackground({ theme = 'dark' }: DigitalSerenityBackgroundProps) {
  const [mousePos, setMousePos] = useState({ left: '0px', top: '0px', opacity: 0 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const floatRefs = useRef<Element[]>([]);

  const isLight = theme === 'light';

  const bgStyles = `
    #ds-mouse-gradient {
      position: fixed;
      pointer-events: none;
      border-radius: 9999px;
      background-image: ${isLight 
        ? 'radial-gradient(circle, rgba(124, 58, 237, 0.08), rgba(45, 192, 141, 0.06), transparent 70%)'
        : 'radial-gradient(circle, rgba(156, 163, 175, 0.05), rgba(107, 114, 128, 0.05), transparent 70%)'
      };
      transform: translate(-50%, -50%);
      will-change: left, top, opacity;
      transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out;
      width: 24rem;
      height: 24rem;
      filter: blur(48px);
      z-index: 0;
    }
    @keyframes ds-grid-draw {
      0%   { stroke-dashoffset: 1000; opacity: 0; }
      50%  { opacity: 0.3; }
      100% { stroke-dashoffset: 0; opacity: ${isLight ? '0.08' : '0.15'}; }
    }
    @keyframes ds-pulse-glow {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(1.1); }
    }
    @keyframes ds-appear {
      0%   { opacity: 0; transform: translateY(30px) scale(0.8); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ds-float {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
      25%       { transform: translateY(-10px) translateX(5px); opacity: 0.6; }
      50%       { transform: translateY(-5px) translateX(-3px); opacity: 0.4; }
      75%       { transform: translateY(-15px) translateX(7px); opacity: 0.8; }
    }
    .ds-grid-line {
      stroke: ${isLight ? '#94a3b8' : '#cbd5e1'};
      stroke-width: 0.5;
      opacity: 0;
      stroke-dasharray: 5 5;
      stroke-dashoffset: 1000;
      animation: ds-grid-draw 2s ease-out forwards;
    }
    .ds-detail-dot {
      fill: ${isLight ? '#64748b' : '#cbd5e1'};
      opacity: 0;
      animation: ds-pulse-glow 3s ease-in-out infinite;
    }
    .ds-corner {
      position: fixed;
      width: 40px;
      height: 40px;
      border: 1px solid ${isLight ? 'rgba(100, 116, 139, 0.15)' : 'rgba(203, 213, 225, 0.2)'};
      opacity: 0;
      animation: ds-appear 1s ease-out forwards;
      pointer-events: none;
      z-index: 1;
    }
    .ds-float-dot {
      position: fixed;
      width: 2px;
      height: 2px;
      background: ${isLight ? '#64748b' : '#cbd5e1'};
      border-radius: 50%;
      opacity: 0;
      animation: ds-float 4s ease-in-out infinite;
      animation-play-state: paused;
      pointer-events: none;
      z-index: 1;
    }
    .ds-ripple {
      position: fixed;
      width: 4px;
      height: 4px;
      background: ${isLight ? 'rgba(124, 58, 237, 0.4)' : 'rgba(203, 213, 225, 0.6)'};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: ds-pulse-glow 1s ease-out forwards;
      z-index: 9999;
    }
  `;

  useEffect(() => {
    const onMove = (e: MouseEvent) =>
      setMousePos({ left: `${e.clientX}px`, top: `${e.clientY}px`, opacity: 1 });
    const onLeave = () =>
      setMousePos(p => ({ ...p, opacity: 0 }));
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const r: Ripple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev, r]);
      setTimeout(() => setRipples(prev => prev.filter(x => x.id !== r.id)), 1000);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    floatRefs.current = Array.from(document.querySelectorAll('.ds-float-dot'));
    const onScroll = () => {
      if (scrolled) return;
      setScrolled(true);
      floatRefs.current.forEach((el, i) => {
        const delay = (parseFloat((el as HTMLElement).style.animationDelay || '0') * 1000) + i * 100;
        setTimeout(() => {
          if (el) {
            (el as HTMLElement).style.animationPlayState = 'running';
            (el as HTMLElement).style.opacity = '';
          }
        }, delay);
      });
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolled]);

  return (
    <>
      <style>{bgStyles}</style>

      {/* Fixed gradient base */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: isLight 
            ? 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 40%, #ede9fe 70%, #f0f9ff 100%)' 
            : 'linear-gradient(to bottom right, #0f172a, #000000, #1e293b)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* SVG grid overlay */}
      <svg
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dsGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={isLight ? "rgba(100, 116, 139, 0.05)" : "rgba(100, 116, 139, 0.1)"} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dsGrid)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="ds-grid-line" style={{ animationDelay: '0.5s' }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="ds-grid-line" style={{ animationDelay: '1s' }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="ds-grid-line" style={{ animationDelay: '1.5s' }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="ds-grid-line" style={{ animationDelay: '2s' }} />
        <circle cx="20%" cy="20%" r="2" className="ds-detail-dot" style={{ animationDelay: '3s' }} />
        <circle cx="80%" cy="20%" r="2" className="ds-detail-dot" style={{ animationDelay: '3.2s' }} />
        <circle cx="20%" cy="80%" r="2" className="ds-detail-dot" style={{ animationDelay: '3.4s' }} />
        <circle cx="80%" cy="80%" r="2" className="ds-detail-dot" style={{ animationDelay: '3.6s' }} />
        <circle cx="50%" cy="50%" r="1.5" className="ds-detail-dot" style={{ animationDelay: '4s' }} />
      </svg>

      {/* Corner accent brackets */}
      <div className="ds-corner" style={{ top: '1.5rem', left: '1.5rem', animationDelay: '4s' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, background: isLight ? '#64748b' : '#cbd5e1', opacity: 0.3, borderRadius: '50%' }} />
      </div>
      <div className="ds-corner" style={{ top: '1.5rem', right: '1.5rem', animationDelay: '4.2s' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: isLight ? '#64748b' : '#cbd5e1', opacity: 0.3, borderRadius: '50%' }} />
      </div>
      <div className="ds-corner" style={{ bottom: '1.5rem', left: '1.5rem', animationDelay: '4.4s' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, background: isLight ? '#64748b' : '#cbd5e1', opacity: 0.3, borderRadius: '50%' }} />
      </div>
      <div className="ds-corner" style={{ bottom: '1.5rem', right: '1.5rem', animationDelay: '4.6s' }}>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, background: isLight ? '#64748b' : '#cbd5e1', opacity: 0.3, borderRadius: '50%' }} />
      </div>

      {/* Floating ambient dots (activate on scroll) */}
      <div className="ds-float-dot" style={{ top: '25%', left: '15%', animationDelay: '0.5s' }} />
      <div className="ds-float-dot" style={{ top: '60%', left: '85%', animationDelay: '1s' }} />
      <div className="ds-float-dot" style={{ top: '40%', left: '10%', animationDelay: '1.5s' }} />
      <div className="ds-float-dot" style={{ top: '75%', left: '90%', animationDelay: '2s' }} />

      {/* Mouse radial glow */}
      <div
        id="ds-mouse-gradient"
        style={{ left: mousePos.left, top: mousePos.top, opacity: mousePos.opacity }}
      />

      {/* Click ripples */}
      {ripples.map(r => (
        <div key={r.id} className="ds-ripple" style={{ left: `${r.x}px`, top: `${r.y}px` }} />
      ))}
    </>
  );
}
