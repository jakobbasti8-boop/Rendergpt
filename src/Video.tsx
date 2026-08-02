import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {RenderRequest} from './types';

const palette = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#fb7185', '#34d399'];

const Node: React.FC<{x: number; y: number; color: string; label?: string; opacity?: number}> = ({x, y, color, label, opacity = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '28', border: '2px solid ' + color, color, fontSize: 22, fontWeight: 800, opacity, boxShadow: '0 0 28px ' + color + '70'}}>
    {label}
  </div>
);

const Diagram: React.FC<{scene: number; frame: number; accent: string}> = ({scene, frame, accent}) => {
  const pulse = 0.72 + Math.sin(frame / 12) * 0.22;
  const dot = (x: number, y: number, size = 13, color = accent) => <div key={x + '-' + y} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: 999, background: color, boxShadow: '0 0 24px ' + color, opacity: pulse}} />;
  const line = (x: number, y: number, w: number, rot = 0, color = accent) => <div key={x + '-' + y + '-' + rot} style={{position: 'absolute', left: x, top: y, width: w, height: 3, borderRadius: 99, background: color, transformOrigin: '0 0', transform: 'rotate(' + rot + 'deg)', opacity: 0.75}} />;

  if (scene === 0) return <div style={{position: 'relative', width: 560, height: 560}}>
    {[0,1,2,3,4,5].map(i => <Node key={i} x={230 + Math.cos(frame / 26 + i) * 155} y={230 + Math.sin(frame / 26 + i) * 155} color={palette[i]} label="?" opacity={0.8} />)}
    <Node x={248} y={248} color="#fff" label="LLM" />
    <div style={{position: 'absolute', bottom: 48, width: '100%', textAlign: 'center', color: '#cbd5e1', fontSize: 24}}>Verhalten messbar. Mechanismus oft offen.</div>
  </div>;

  if (scene === 1) return <div style={{position: 'relative', width: 560, height: 560}}>
    <div style={{position: 'absolute', top: 80, left: 28, color: '#94a3b8', fontSize: 23}}>Beispiel im Prompt</div>
    {['ROT → 1', 'BLAU → 2', 'GRÜN → ?'].map((t, i) => <div key={t} style={{position: 'absolute', left: 45, top: 130 + i * 87, padding: '17px 24px', borderRadius: 14, border: '2px solid ' + (i === 2 ? accent : '#64748b'), color: '#fff', fontSize: 25, background: i === 2 ? accent + '25' : '#0f172a'}}>{t}</div>)}
    {line(300, 175, 150, 0)}{line(300, 262, 150, 0)}{line(300, 349, 150, 0)}
    <Node x={448} y={230} color={accent} label="2" />
    <div style={{position: 'absolute', bottom: 42, width: '100%', textAlign: 'center', color: '#cbd5e1', fontSize: 23}}>Lernt aus Beispielen – ohne Gewichte zu ändern</div>
  </div>;

  if (scene === 2) return <div style={{position: 'relative', width: 560, height: 560}}>
    {Array.from({length: 22}).map((_, i) => line(45 + (i % 5) * 100, 105 + ((i * 53) % 300), 260, -42 + (i % 4) * 28, palette[i % palette.length]))}
    {Array.from({length: 24}).map((_, i) => dot(45 + ((i * 83) % 450), 85 + ((i * 131) % 370), 11, palette[i % palette.length]))}
    <Node x={248} y={237} color="#fff" label="1" />
    <div style={{position: 'absolute', bottom: 38, width: '100%', textAlign: 'center', color: '#cbd5e1', fontSize: 23}}>Viele Konzepte teilen sich denselben Raum</div>
  </div>;

  if (scene === 3) return <div style={{position: 'relative', width: 560, height: 560}}>
    <div style={{position: 'absolute', left: 65, top: 70, width: 4, height: 385, background: '#64748b'}} />
    <div style={{position: 'absolute', left: 65, top: 455, width: 440, height: 4, background: '#64748b'}} />
    <svg width="560" height="560" style={{position: 'absolute', inset: 0}}>
      <path d="M70 125 C160 140, 250 170, 490 405" fill="none" stroke="#fb7185" strokeWidth="8" />
      <path d="M70 145 C220 190, 315 385, 410 390 S470 240, 500 125" fill="none" stroke="#34d399" strokeWidth="8" strokeDasharray="14 8" />
    </svg>
    <div style={{position: 'absolute', left: 90, top: 92, color: '#fb7185', fontSize: 22}}>Training</div>
    <div style={{position: 'absolute', right: 30, top: 95, color: '#34d399', fontSize: 22}}>Generalisierung</div>
    <div style={{position: 'absolute', bottom: 35, width: '100%', textAlign: 'center', color: '#cbd5e1', fontSize: 23}}>Erst auswendig – viel später plötzlich verstanden</div>
  </div>;

  if (scene === 4) return <div style={{position: 'relative', width: 560, height: 560}}>
    <div style={{position: 'absolute', left: 65, top: 80, width: 4, height: 370, background: '#64748b'}} />
    <div style={{position: 'absolute', left: 65, top: 450, width: 445, height: 4, background: '#64748b'}} />
    <svg width="560" height="560" style={{position: 'absolute', inset: 0}}>
      <path d="M75 420 C170 405, 300 350, 495 115" fill="none" stroke="#22d3ee" strokeWidth="9" />
      <path d="M75 430 L300 430 L302 135 L500 135" fill="none" stroke="#fbbf24" strokeWidth="7" strokeDasharray="14 9" />
    </svg>
    <div style={{position: 'absolute', left: 300, top: 92, color: '#fbbf24', fontSize: 21}}>„plötzlicher“ Sprung</div>
    <div style={{position: 'absolute', bottom: 35, width: '100%', textAlign: 'center', color: '#cbd5e1', fontSize: 23}}>Manche Sprünge entstehen erst durch die Messmethode</div>
  </div>;

  if (scene === 5) return <div style={{position: 'relative', width: 560, height: 560}}>
    {Array.from({length: 7}).map((_, i) => line(55, 80 + i * 58, 450, 0, '#334155'))}
    {Array.from({length: 7}).map((_, i) => line(55 + i * 68, 80, 350, 90, '#334155'))}
    <div style={{position: 'absolute', left: 70, top: 126, padding: '14px 18px', borderRadius: 12, background: '#34d39930', border: '2px solid #34d399', fontSize: 22}}>freundliche Formulierung</div>
    <div style={{position: 'absolute', left: 125, top: 285, padding: '14px 18px', borderRadius: 12, background: '#fb718530', border: '2px solid #fb7185', fontSize: 22}}>nur ein Detail anders</div>
    <div style={{position: 'absolute', right: 48, top: 210, width: 115, height: 115, borderRadius: 999, background: accent + '26', border: '3px solid ' + accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 47}}>?</div>
    <div style={{position: 'absolute', bottom: 35, width: '100%', textAlign: 'center', color: '#cbd5e1', fontSize: 23}}>Kleine Prompt-Änderung, große Verhaltensänderung</div>
  </div>;

  return null;
};

export const ExplainerVideo: React.FC<{request: RenderRequest}> = ({request}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const totalScenes = Math.max(1, request.scenes.length);
  const sceneLength = durationInFrames / totalScenes;
  const sceneIndex = Math.min(totalScenes - 1, Math.floor(frame / sceneLength));
  const scene = request.scenes[sceneIndex];
  const localFrame = frame - sceneIndex * sceneLength;
  const appear = spring({frame: localFrame, fps, config: {damping: 18, stiffness: 90}});
  const fadeOut = interpolate(localFrame, [sceneLength - 15, sceneLength], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const accent = palette[sceneIndex % palette.length];

  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 15%, #1d3159 0%, #0a1020 48%, #030712 100%)', color: 'white', fontFamily: 'Inter, Arial, Helvetica, sans-serif', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize: '64px 64px'}} />
      <div style={{position: 'absolute', top: 58, left: 86, right: 86, display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase'}}><span>LLM BLACK BOX · FAKT {sceneIndex + 1}/6</span><span>{Math.round(progress)}%</span></div>
      <div style={{position: 'absolute', left: 104, right: 104, top: 150, bottom: 135, display: 'flex', alignItems: 'center', gap: 52, opacity: fadeOut}}>
        <div style={{width: 925, transform: 'translateY(' + ((1 - appear) * 45) + 'px)', opacity: appear}}>
          <div style={{color: accent, fontSize: 28, fontWeight: 800, letterSpacing: 3, marginBottom: 22}}>FAKT {sceneIndex + 1}</div>
          <div style={{fontSize: 71, lineHeight: 1.03, fontWeight: 900, textShadow: '0 20px 70px rgba(0,0,0,.5)'}}>{scene.title}</div>
          <div style={{marginTop: 30, fontSize: 35, lineHeight: 1.32, color: '#e2e8f0', maxWidth: 880}}>{scene.text}</div>
        </div>
        <Diagram scene={sceneIndex} frame={frame} accent={accent} />
      </div>
      <div style={{position: 'absolute', left: 86, right: 86, bottom: 55, height: 14, borderRadius: 99, background: '#ffffff22'}}><div style={{height: '100%', width: progress + '%', borderRadius: 99, background: 'linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6)'}} /></div>
      <div style={{position: 'absolute', left: 86, bottom: 83, color: '#94a3b8', fontSize: 25}}>{request.title} — {request.subtitle}</div>
    </AbsoluteFill>
  );
};