import React, { useEffect, useRef } from 'react';

/**
 * CinematicBackground
 * State-of-the-art IMAX & Hollywood Theater atmospheric background:
 * - Interactive cursor-following cinema spotlight (60fps via requestAnimationFrame)
 * - Dual sweeping premiere searchlights / projector beams
 * - Anamorphic horizontal lens flare sweeps
 * - Rising golden cinema embers & floating bokeh dust motes
 * - Multi-hue pulsing nebula ambient orbs (Cobalt, Violet, Cyan, Amber, Ruby)
 * - Rotating geometric cinema reel / lens aperture rings
 * - 35mm celluloid film scanline & vignette depth
 */
export default function CinematicBackground() {
  const spotlightRef = useRef(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 3;
    let currentX = mouseX;
    let currentY = mouseY;
    let animId = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updatePosition = () => {
      // Smooth lerp easing for silky organic cursor spotlight
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX - 250}px, ${currentY - 250}px, 0)`;
      }

      animId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Deep Obsidian Base Theater Canvas */}
      <div className="absolute inset-0 bg-[#06080e]" />

      {/* 2. Interactive Ambient Cursor Spotlight (Tethered 60fps glow) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -top-0 -left-0 h-[500px] w-[500px] rounded-full opacity-60 blur-[100px] transition-opacity duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(139, 92, 246, 0.12) 40%, rgba(245, 158, 11, 0.05) 70%, transparent 100%)',
          willChange: 'transform'
        }}
      />

      {/* 3. Primary Center Cinema Projector Light Cone */}
      <div className="projector-beam-primary absolute -top-48 left-1/2 -translate-x-1/2 h-[800px] w-[950px] bg-gradient-to-b from-sky-400/22 via-indigo-500/12 to-transparent blur-[110px] rounded-full pointer-events-none" />

      {/* 4. Sweeping Dual Premiere Searchlights */}
      <div className="searchlight-left absolute -top-32 -left-20 h-[850px] w-[450px] bg-gradient-to-br from-blue-500/18 via-purple-600/08 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="searchlight-right absolute -top-32 -right-20 h-[850px] w-[450px] bg-gradient-to-bl from-purple-500/18 via-cyan-500/08 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* 5. Anamorphic Horizontal Cinema Lens Flares */}
      <div className="anamorphic-flare flare-1 absolute top-[18%] -left-[20%] h-[3px] w-[140%] bg-gradient-to-r from-transparent via-cyan-400/35 via-blue-400/40 via-purple-400/25 to-transparent blur-[2px]" />
      <div className="anamorphic-flare flare-2 absolute top-[55%] -left-[20%] h-[2px] w-[140%] bg-gradient-to-r from-transparent via-purple-400/25 via-amber-400/30 to-transparent blur-[3px]" />

      {/* 6. Rotating Ambient Cinema Reel / Aperture Rings (Subtle geometric film motif) */}
      <div className="film-reel-ring reel-left absolute -top-24 -left-28 h-[520px] w-[520px] opacity-[0.045] pointer-events-none">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeWidth="1" strokeDasharray="12 12" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="white" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="28" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="4 8" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="film-reel-ring reel-right absolute top-[60%] -right-28 h-[580px] w-[580px] opacity-[0.038] pointer-events-none">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <circle cx="100" cy="100" r="92" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="8 8" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="16 8" />
          <circle cx="100" cy="100" r="46" fill="none" stroke="#60a5fa" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="24" fill="none" stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="3 6" />
        </svg>
      </div>

      {/* 7. Animated Floating Multi-Chromatic Nebula Glow Clouds */}
      <div className="orb-glow orb-1 absolute -top-20 -left-20 h-[580px] w-[580px] rounded-full bg-blue-600/22 blur-[140px]" />
      <div className="orb-glow orb-2 absolute top-1/4 -right-28 h-[620px] w-[620px] rounded-full bg-purple-600/20 blur-[150px]" />
      <div className="orb-glow orb-3 absolute top-2/3 -left-28 h-[520px] w-[520px] rounded-full bg-cyan-500/16 blur-[130px]" />
      <div className="orb-glow orb-4 absolute -bottom-24 right-1/4 h-[600px] w-[600px] rounded-full bg-amber-500/16 blur-[160px]" />
      <div className="orb-glow orb-5 absolute bottom-1/3 left-1/3 h-[460px] w-[460px] rounded-full bg-rose-600/12 blur-[145px]" />

      {/* 8. Rising Golden Cinema Embers (Movie premiere golden sparks) */}
      <div className="cinema-ember ember-1" style={{ left: '12%', animationDelay: '0.2s', animationDuration: '8.5s' }} />
      <div className="cinema-ember ember-2" style={{ left: '28%', animationDelay: '2.4s', animationDuration: '9.8s' }} />
      <div className="cinema-ember ember-3" style={{ left: '44%', animationDelay: '4.1s', animationDuration: '8.2s' }} />
      <div className="cinema-ember ember-4" style={{ left: '62%', animationDelay: '1.2s', animationDuration: '10.5s' }} />
      <div className="cinema-ember ember-5" style={{ left: '78%', animationDelay: '3.6s', animationDuration: '8.9s' }} />
      <div className="cinema-ember ember-6" style={{ left: '91%', animationDelay: '5.2s', animationDuration: '9.2s' }} />

      {/* 9. Floating Bokeh Dust Particles (Cinema projector dust motes) */}
      <div className="bokeh-particle p-1" style={{ top: '14%', left: '18%', animationDelay: '0s', animationDuration: '8s' }} />
      <div className="bokeh-particle p-2" style={{ top: '22%', left: '72%', animationDelay: '2.5s', animationDuration: '10s' }} />
      <div className="bokeh-particle p-3" style={{ top: '42%', left: '32%', animationDelay: '4.2s', animationDuration: '9s' }} />
      <div className="bokeh-particle p-1" style={{ top: '60%', left: '84%', animationDelay: '1.8s', animationDuration: '8.5s' }} />
      <div className="bokeh-particle p-2" style={{ top: '78%', left: '14%', animationDelay: '5.5s', animationDuration: '11s' }} />
      <div className="bokeh-particle p-3" style={{ top: '32%', left: '58%', animationDelay: '3.2s', animationDuration: '7.8s' }} />
      <div className="bokeh-particle p-1" style={{ top: '70%', left: '46%', animationDelay: '6.2s', animationDuration: '9.4s' }} />
      <div className="bokeh-particle p-2" style={{ top: '88%', left: '68%', animationDelay: '1.0s', animationDuration: '10.2s' }} />

      {/* 10. Subtle Celluloid Film Grid / Star Dust Matrix */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* 11. Subtle 35mm Celluloid Scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 3px)'
        }}
      />

      {/* 12. Deep IMAX Theater Edge Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(4,6,11,0.75)_80%,rgba(3,4,8,0.95)_100%)]" />
    </div>
  );
}
