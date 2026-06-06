import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {RenderRequest} from './types';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;

const bg: React.CSSProperties = {
  background:
    'radial-gradient(circle at 12% 12%, rgba(34,211,238,0.22), transparent 32%), radial-gradient(circle at 88% 16%, rgba(168,85,247,0.20), transparent 30%), linear-gradient(135deg, #050816 0%, #0f172a 46%, #111827 100%)',
  color: 'white',
  fontFamily: 'Inter, Arial, Helvetica, sans-serif',
  overflow: 'hidden',
};

const grid: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
  backgroundSize: '72px 72px',
  opacity: 0.52,
};

const panel: React.CSSProperties = {
  border: '2px solid rgba(255,255,255,0.16)',
  background: 'rgba(15, 23, 42, 0.78)',
  boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
  borderRadius: 34,
};

const tag: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  padding: '12px 22px',
  fontSize: 26,
  fontWeight: 800,
  background: 'rgba(255,255,255,0.11)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const softText: React.CSSProperties = {
  color: 'rgba(255,255,255,0.72)',
};

const noise = (i: number, frame: number) => Math.sin(i * 12.9898 + frame * 0.37) * 43758.5453 % 1;
const frameSafe = (p: number, i: number) => p * Math.PI * 2 + i * 0.9;

const SceneHeading: React.FC<{
  title: string;
  text: string;
  appear: number;
  fade: number;
}> = ({title, text, appear, fade}) => (
  <div
    style={{
      position: 'absolute',
      left: 80,
      top: 78,
      width: 720,
      opacity: fade,
      transform: `translateY(${(1 - appear) * 40}px)`,
    }}
  >
    <div
      style={{
        fontSize: 28,
        letterSpacing: 4,
        textTransform: 'uppercase',
        color: '#67e8f9',
        fontWeight: 900,
        marginBottom: 18,
      }}
    >
      Animated AI Explainer
    </div>
    <div
      style={{
        fontSize: 66,
        lineHeight: 1.03,
        fontWeight: 950,
        textShadow: '0 16px 50px rgba(0,0,0,0.45)',
      }}
    >
      {title}
    </div>
    <div
      style={{
        marginTop: 24,
        fontSize: 30,
        lineHeight: 1.25,
        color: 'rgba(255,255,255,0.82)',
      }}
    >
      {text}
    </div>
  </div>
);

const Token: React.FC<{
  label: string;
  x: number;
  y: number;
  active?: boolean;
  scale?: number;
}> = ({label, x, y, active, scale = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `scale(${scale})`,
      width: 150,
      height: 72,
      borderRadius: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 31,
      fontWeight: 900,
      background: active
        ? 'linear-gradient(135deg, #22d3ee, #818cf8)'
        : 'rgba(255,255,255,0.11)',
      border: '2px solid rgba(255,255,255,0.22)',
      boxShadow: active ? '0 0 46px rgba(34,211,238,0.65)' : '0 18px 46px rgba(0,0,0,0.25)',
    }}
  >
    {label}
  </div>
);

const Line: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  width?: number;
  color?: string;
}> = ({x1, y1, x2, y2, progress, width = 4, color = '#22d3ee'}) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={len}
      strokeDashoffset={len * (1 - progress)}
      opacity={0.25 + progress * 0.65}
    />
  );
};

const TitleOverview: React.FC<{p: number}> = ({p}) => {
  const hit = spring({frame: p * 80, fps: 24, config: {damping: 14, stiffness: 110}});
  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <div
        style={{
          ...panel,
          position: 'absolute',
          left: 100,
          top: 225,
          width: 1500,
          height: 560,
          overflow: 'hidden',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: mix(110, 570, hit),
          top: 370 + Math.sin(p * Math.PI * 2) * 12,
          fontSize: 128,
          filter: 'drop-shadow(0 0 35px rgba(34,211,238,0.75))',
        }}
      >
        ⚙️
      </div>
      <div
        style={{
          position: 'absolute',
          right: mix(110, 570, hit),
          top: 370 + Math.cos(p * Math.PI * 2) * 12,
          fontSize: 128,
          filter: 'drop-shadow(0 0 35px rgba(249,115,22,0.75))',
        }}
      >
        ⚡
      </div>
      <div
        style={{
          position: 'absolute',
          left: 432,
          right: 432,
          top: 290,
          textAlign: 'center',
          fontSize: 76,
          lineHeight: 1.05,
          fontWeight: 950,
          opacity: clamp01((p - 0.16) / 0.25),
        }}
      >
        Transformer vs. Diffusion
      </div>
      <div style={{position: 'absolute', left: 460, top: 570, display: 'flex', gap: 22}}>
        {['Text → Transformer', 'Bild → Diffusion', 'Hybrid → DiT'].map((x, i) => (
          <div
            key={x}
            style={{
              ...tag,
              opacity: clamp01((p - 0.34 - i * 0.08) / 0.18),
              transform: `translateY(${(1 - clamp01((p - 0.34 - i * 0.08) / 0.18)) * 35}px)`,
              color: i === 1 ? '#fda4af' : i === 2 ? '#c4b5fd' : '#67e8f9',
            }}
          >
            {x}
          </div>
        ))}
      </div>
    </div>
  );
};

const AttentionLive: React.FC<{p: number; frame: number}> = ({p, frame}) => {
  const words = p > 0.58 ? ['Der', 'Hund', 'bellt', 'laut'] : ['Der', 'Hund', 'bellt'];
  const coords = words.map((_, i) => ({x: 930 + i * 185, y: 470 + Math.sin(frame / 18 + i) * 6}));
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      {coords.flatMap((a, i) =>
        coords.map((b, j) =>
          i === j ? null : (
            <Line
              key={`${i}-${j}`}
              x1={a.x + 75}
              y1={a.y + 36}
              x2={b.x + 75}
              y2={b.y + 36}
              progress={clamp01((p - 0.12) / 0.35)}
              width={i === 2 && j === 1 ? 11 : 3 + ((i + j) % 3)}
              color={i === 2 && j === 1 ? '#fbbf24' : ['#22d3ee', '#34d399', '#a78bfa'][i % 3]}
            />
          )
        )
      )}
      <foreignObject x="880" y="245" width="850" height="520">
        <div style={{position: 'relative', width: 850, height: 520}}>
          {words.map((w, i) => (
            <Token key={w} label={w} x={50 + i * 185} y={225} active={i === 1 || i === 2} />
          ))}
          <div style={{position: 'absolute', left: 125, top: 350, fontSize: 26, ...softText}}>
            Heatmap für „bellt“ → Hund = hoher Kontextwert
          </div>
          {[0.25, 0.88, 0.55, 0.34].slice(0, words.length).map((v, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 70 + i * 185,
                top: 405,
                width: 115,
                height: 48,
                borderRadius: 13,
                background: `rgba(251,191,36,${0.18 + v * 0.7})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {Math.round(v * 100)}%
            </div>
          ))}
        </div>
      </foreignObject>
    </svg>
  );
};

const ArchitectureBlocks: React.FC<{p: number; decoder?: boolean}> = ({p, decoder}) => {
  const blocks = decoder
    ? ['Input', 'Masked Attn', 'Cross-Attn', 'Add & Norm', 'Feed Forward', 'Output']
    : ['Embedding', 'Head A', 'Head B', 'Head C', 'Add & Norm', 'FFN', 'Probabilities'];
  return (
    <div style={{position: 'absolute', left: 850, top: 205, width: 900, height: 650}}>
      {blocks.map((b, i) => {
        const show = clamp01((p - i * 0.07) / 0.16);
        return (
          <div
            key={b}
            style={{
              ...panel,
              position: 'absolute',
              left: 80 + (i % 3) * 250,
              top: 80 + Math.floor(i / 3) * 180,
              width: 205,
              height: 115,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 900,
              textAlign: 'center',
              opacity: show,
              transform: `translateY(${(1 - show) * 30}px) scale(${0.92 + show * 0.08})`,
              background:
                b.includes('Attn') || b.includes('Head')
                  ? 'rgba(34,211,238,0.18)'
                  : b.includes('Norm')
                    ? 'rgba(34,197,94,0.18)'
                    : b.includes('FF')
                      ? 'rgba(250,204,21,0.18)'
                      : 'rgba(255,255,255,0.10)',
            }}
          >
            {b}
          </div>
        );
      })}
      <svg width={900} height={650} style={{position: 'absolute', inset: 0}}>
        {blocks.slice(0, -1).map((_, i) => {
          const x1 = 80 + (i % 3) * 250 + 205;
          const y1 = 80 + Math.floor(i / 3) * 180 + 58;
          const x2 = 80 + ((i + 1) % 3) * 250;
          const y2 = 80 + Math.floor((i + 1) / 3) * 180 + 58;
          return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} progress={clamp01((p - 0.2 - i * 0.08) / 0.16)} />;
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: mix(55, 690, clamp01(p)),
          top: 40 + Math.sin(p * Math.PI * 4) * 20,
          width: 34,
          height: 34,
          borderRadius: 999,
          background: '#f472b6',
          boxShadow: '0 0 38px #f472b6',
        }}
      />
    </div>
  );
};

const TokenPrediction: React.FC<{p: number; masked?: boolean}> = ({p, masked}) => {
  const bars = masked
    ? [['heißer', 0.2], ['frischer', 0.28], ['starker', 0.76]]
    : [['einen', 0.82], ['den', 0.48], ['keinen', 0.18]];
  const chosen = masked ? 'starker' : 'einen';
  return (
    <div style={{position: 'absolute', left: 890, top: 240, width: 840, height: 610}}>
      <div style={{...panel, position: 'absolute', inset: 0, padding: 48}}>
        <div style={{fontSize: 42, fontWeight: 900, marginBottom: 34}}>
          {masked ? 'BERT: Ich möchte [MASK] Kaffee' : 'GPT: Ich möchte ___ Kaffee'}
        </div>
        <div style={{display: 'flex', gap: 18, marginBottom: 50}}>
          {['Ich', 'möchte', p > 0.7 ? chosen : masked ? '[MASK]' : '___', 'Kaffee'].map((w, i) => (
            <div
              key={i}
              style={{
                ...tag,
                minWidth: 128,
                color: i === 2 ? '#fbbf24' : 'white',
                transform: i === 2 && p > 0.7 ? 'scale(1.12)' : 'scale(1)',
              }}
            >
              {w}
            </div>
          ))}
        </div>
        {bars.map(([label, value], i) => {
          const width = 440 * Number(value) * clamp01((p - 0.18) / 0.36);
          const winner = (!masked && i === 0) || (masked && i === 2);
          return (
            <div key={String(label)} style={{marginBottom: 26}}>
              <div style={{fontSize: 25, marginBottom: 8, ...softText}}>{label}</div>
              <div style={{height: 36, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
                <div
                  style={{
                    width,
                    height: '100%',
                    borderRadius: 99,
                    background: winner ? '#22d3ee' : '#64748b',
                    boxShadow: '0 0 26px rgba(34,211,238,0.55)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DiffusionImage: React.FC<{p: number; reverse?: boolean; slider?: boolean}> = ({p, reverse, slider}) => {
  const clean = reverse ? p : 1 - p;
  const dots = Array.from({length: 70});
  return (
    <div style={{position: 'absolute', left: 910, top: 215, width: 760, height: 620}}>
      <div
        style={{
          ...panel,
          position: 'absolute',
          left: 65,
          top: 35,
          width: 520,
          height: 440,
          overflow: 'hidden',
          background: `linear-gradient(135deg, rgba(59,130,246,${0.22 + clean * 0.24}), rgba(244,114,182,${0.08 + clean * 0.28}))`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 160,
            top: 90,
            width: 200,
            height: 200,
            borderRadius: clean > 0.45 ? '50% 50% 46% 46%' : 18,
            background: `rgba(251,191,36,${clean})`,
            boxShadow: `0 0 ${40 + clean * 45}px rgba(251,191,36,${clean * 0.65})`,
            transform: `scale(${0.75 + clean * 0.3}) rotate(${(1 - clean) * 20}deg)`,
          }}
        />
        <div style={{position: 'absolute', left: 222, top: 155, fontSize: 54, opacity: clean}}>🐱</div>
        {dots.map((_, i) => {
          const n = Math.abs(noise(i, Math.round(p * 200)));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(i * 37) % 500}px`,
                top: `${(i * 83) % 420}px`,
                width: 10 + (i % 6) * 3,
                height: 10 + (i % 6) * 3,
                borderRadius: 999,
                background: `rgba(255,255,255,${(1 - clean) * (0.35 + n * 0.55)})`,
              }}
            />
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 80, top: 520, width: 500}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, ...softText}}>
          <span>{reverse ? 'Rauschen' : 'Bild'}</span>
          <span>t = {Math.round((reverse ? 1 - p : p) * 1000)}</span>
          <span>{reverse ? 'Bild' : 'Rauschen'}</span>
        </div>
        <div style={{height: 18, marginTop: 16, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
          <div style={{width: `${p * 100}%`, height: '100%', background: slider ? 'linear-gradient(90deg,#ef4444,#22c55e)' : '#22d3ee'}} />
        </div>
      </div>
    </div>
  );
};

const UNetVisual: React.FC<{p: number; prompt?: boolean}> = ({p, prompt}) => {
  const left = [130, 190, 250];
  const right = [250, 190, 130];
  return (
    <div style={{position: 'absolute', left: 850, top: 170, width: 950, height: 720}}>
      <svg width={950} height={720} style={{position: 'absolute'}}>
        {[0, 1, 2].map((i) => (
          <Line
            key={`down-${i}`}
            x1={170 + i * 140}
            y1={left[i] + 60}
            x2={310 + i * 140}
            y2={(left[i + 1] ?? 340) + 60}
            progress={clamp01((p - i * 0.07) / 0.25)}
            color="#22d3ee"
            width={6}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <Line
            key={`up-${i}`}
            x1={585 + i * 120}
            y1={(right[i + 1] ?? 340) + 60}
            x2={705 + i * 70}
            y2={right[i] + 60}
            progress={clamp01((p - 0.28 - i * 0.07) / 0.24)}
            color="#a78bfa"
            width={6}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <Line
            key={`skip-${i}`}
            x1={170 + i * 140}
            y1={left[i] + 60}
            x2={760 - i * 35}
            y2={right[i] + 60}
            progress={clamp01((p - 0.36 - i * 0.06) / 0.2)}
            color="#fbbf24"
            width={5}
          />
        ))}
      </svg>
      {[0, 1, 2].map((i) => (
        <div key={`l${i}`} style={{...panel, position: 'absolute', left: 90 + i * 140, top: left[i], width: 160, height: 110, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 900}}>
          Down {i + 1}
        </div>
      ))}
      <div style={{...panel, position: 'absolute', left: 450, top: 335, width: 170, height: 120, display: 'grid', placeItems: 'center', fontSize: 25, fontWeight: 900, background: 'rgba(244,114,182,0.18)'}}>
        Bottleneck
      </div>
      {[0, 1, 2].map((i) => (
        <div key={`r${i}`} style={{...panel, position: 'absolute', left: 670 + i * 70, top: right[i], width: 160, height: 110, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 900}}>
          Up {3 - i}
        </div>
      ))}
      {prompt && (
        <>
          <div style={{...tag, position: 'absolute', left: 205, top: 35, opacity: clamp01((p - 0.12) / 0.22)}}>„Astronaut auf Pferd“</div>
          <div style={{...panel, position: 'absolute', left: 390, top: 190, width: 245, height: 85, display: 'grid', placeItems: 'center', color: '#67e8f9', fontSize: 27, fontWeight: 900}}>
            Cross-Attention
          </div>
        </>
      )}
    </div>
  );
};

const PipelineVisual: React.FC<{p: number}> = ({p}) => {
  const steps = ['Prompt', 'Text-Encoder', 'Latent Noise', 'U-Net', 'VAE', 'Bild'];
  return (
    <div style={{position: 'absolute', left: 820, top: 255, width: 980, height: 520}}>
      <svg width={980} height={520} style={{position: 'absolute'}}>
        {steps.slice(0, -1).map((_, i) => (
          <Line key={i} x1={115 + i * 160} y1={235} x2={200 + i * 160} y2={235} progress={clamp01((p - 0.13 - i * 0.08) / 0.18)} width={7} />
        ))}
      </svg>
      {steps.map((s, i) => {
        const a = clamp01((p - i * 0.07) / 0.17);
        return (
          <div
            key={s}
            style={{
              ...panel,
              position: 'absolute',
              left: 10 + i * 160,
              top: 170,
              width: 130,
              height: 130,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              fontSize: 21,
              fontWeight: 900,
              opacity: a,
              transform: `scale(${0.85 + a * 0.15})`,
              background: i === 5 ? 'rgba(34,197,94,0.20)' : 'rgba(255,255,255,0.10)',
              whiteSpace: 'pre-line',
            }}
          >
            {i === 0 ? '🌄\n' : i === 5 ? '📸\n' : ''}
            {s}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 130, top: 360, width: 670}}>
        <div style={{fontSize: 25, ...softText}}>Denoising Step {Math.max(1, Math.round(p * 20))}/20</div>
        <div style={{height: 18, marginTop: 14, borderRadius: 99, background: 'rgba(255,255,255,0.14)', overflow: 'hidden'}}>
          <div style={{width: `${p * 100}%`, height: '100%', background: 'linear-gradient(90deg,#a78bfa,#22d3ee,#22c55e)'}} />
        </div>
      </div>
    </div>
  );
};

const Thumbnails: React.FC<{p: number}> = ({p}) => (
  <div style={{position: 'absolute', left: 860, top: 235, width: 930, height: 560, display: 'flex', gap: 26, alignItems: 'center'}}>
    {[0.05, 0.25, 0.48, 0.72, 1].map((clean, i) => {
      const visible = clamp01((p - i * 0.1) / 0.18);
      return (
        <div key={i} style={{...panel, width: 160, height: 310, padding: 14, opacity: visible, transform: `translateY(${(1-visible)*40}px)`}}>
          <div style={{height: 210, borderRadius: 22, background: `linear-gradient(135deg, rgba(255,255,255,${0.1 + clean * 0.2}), rgba(34,211,238,${clean * 0.35}))`, position: 'relative', overflow: 'hidden'}}>
            {Array.from({length: 18}).map((_, n) => (
              <div key={n} style={{position:'absolute', left:(n*31)%140, top:(n*47)%190, width:8+(n%5)*3, height:8+(n%5)*3, borderRadius:99, background:`rgba(255,255,255,${1-clean})`}} />
            ))}
            <div style={{position:'absolute', left:45, top:72, fontSize:58, opacity: clean}}>🏔️</div>
          </div>
          <div style={{fontSize: 22, textAlign: 'center', marginTop: 20, fontWeight: 900}}>Step {i * 5 + 1}</div>
        </div>
      );
    })}
  </div>
);

const SortingVisual: React.FC<{p: number}> = ({p}) => {
  const cards = [
    ['Text fortsetzen', 'L'],
    ['Bild generieren', 'R'],
    ['Frage beantworten', 'L'],
    ['Foto entrauschen', 'R'],
  ];
  return (
    <div style={{position: 'absolute', left: 820, top: 190, width: 980, height: 650}}>
      <div style={{...panel, position: 'absolute', left: 40, top: 110, width: 380, height: 470, padding: 30}}>
        <div style={{fontSize: 34, fontWeight: 950, color: '#67e8f9'}}>Transformer</div>
        <div style={{fontSize: 64, marginTop: 35}}>💬 🧠 💻</div>
      </div>
      <div style={{...panel, position: 'absolute', right: 40, top: 110, width: 380, height: 470, padding: 30}}>
        <div style={{fontSize: 34, fontWeight: 950, color: '#fda4af'}}>Diffusion</div>
        <div style={{fontSize: 64, marginTop: 35}}>🖼️ 🎧 🧩</div>
      </div>
      {cards.map(([c, side], i) => {
        const a = clamp01((p - 0.1 - i * 0.12) / 0.28);
        return (
          <div
            key={c}
            style={{
              ...tag,
              position: 'absolute',
              left: mix(390, side === 'L' ? 120 : 575, a),
              top: 20 + i * 86,
              opacity: a,
              background: side === 'L' ? 'rgba(34,211,238,0.20)' : 'rgba(244,114,182,0.18)',
            }}
          >
            {c} ✓
          </div>
        );
      })}
    </div>
  );
};

const MatrixVisual: React.FC<{p: number}> = ({p}) => {
  const rows = [
    ['Chat / Übersetzung', 'Transformer'],
    ['Code / Planung', 'Transformer'],
    ['Bild / Inpainting', 'Diffusion'],
    ['Audio / 3D / Video', 'Diffusion'],
  ];
  return (
    <div style={{position:'absolute', left:880, top:220, width:830, height:570, ...panel, padding:38}}>
      <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', fontSize:30, fontWeight:950, marginBottom:26}}>
        <div>Aufgabe</div><div>Best Fit</div>
      </div>
      {rows.map((r,i)=>{
        const a=clamp01((p-i*0.12)/0.22);
        return <div key={i} style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', alignItems:'center', height:88, borderTop:'1px solid rgba(255,255,255,0.12)', opacity:a, transform:`translateX(${(1-a)*50}px)`}}>
          <div style={{fontSize:29}}>{r[0]}</div>
          <div style={{...tag, justifySelf:'start', color:r[1]==='Transformer'?'#67e8f9':'#fda4af'}}>{r[1]}</div>
        </div>
      })}
    </div>
  );
};

const TradeOffVisual: React.FC<{p: number}> = ({p}) => {
  const t = clamp01(p);
  return (
    <div style={{position:'absolute', left:890, top:245, width:820, height:520}}>
      <div style={{...panel, position:'absolute', inset:0, padding:48}}>
        {[
          ['Geschwindigkeit', 0.82, 0.42],
          ['Globale Revision', 0.45, 0.78],
          ['Bildqualität', 0.28, 0.90],
        ].map(([label, tr, df])=>(
          <div key={String(label)} style={{marginBottom:42}}>
            <div style={{fontSize:28, fontWeight:900, marginBottom:14}}>{String(label)}</div>
            <div style={{display:'grid', gridTemplateColumns:'150px 1fr', gap:18, alignItems:'center', marginBottom:12}}>
              <span style={{fontSize:23, color:'#67e8f9'}}>Transformer</span>
              <div style={{height:24, background:'rgba(255,255,255,0.12)', borderRadius:99}}><div style={{height:'100%', width:`${Number(tr)*t*100}%`, background:'#22d3ee', borderRadius:99}} /></div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'150px 1fr', gap:18, alignItems:'center'}}>
              <span style={{fontSize:23, color:'#fda4af'}}>Diffusion</span>
              <div style={{height:24, background:'rgba(255,255,255,0.12)', borderRadius:99}}><div style={{height:'100%', width:`${Number(df)*t*100}%`, background:'#fb7185', borderRadius:99}} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HybridVisual: React.FC<{p: number}> = ({p}) => {
  const merge = clamp01((p - 0.28) / 0.42);
  return (
    <div style={{position:'absolute', left:820, top:225, width:980, height:560}}>
      <div style={{...panel, position:'absolute', left:mix(80,330,merge), top:150, width:260, height:190, display:'grid', placeItems:'center', fontSize:35, fontWeight:950, background:'rgba(34,211,238,0.18)'}}>Transformer</div>
      <div style={{...panel, position:'absolute', right:mix(80,330,merge), top:150, width:260, height:190, display:'grid', placeItems:'center', fontSize:35, fontWeight:950, background:'rgba(244,114,182,0.18)'}}>Diffusion</div>
      <div style={{position:'absolute', left:410, top:206, fontSize:70, opacity:clamp01((p-0.14)/0.18)}}>＋</div>
      <div style={{...panel, position:'absolute', left:360, top:365, width:280, height:110, display:'grid', placeItems:'center', fontSize:44, fontWeight:950, color:'#fbbf24', opacity:merge}}>DiT</div>
      {Array.from({length:7}).map((_,i)=>(
        <div key={i} style={{position:'absolute', left:500+Math.cos(frameSafe(p,i))*190, top:250+Math.sin(frameSafe(p,i))*155, width:18, height:18, borderRadius:99, background:'#fbbf24', opacity:merge}} />
      ))}
    </div>
  );
};

const TextRevisionVisual: React.FC<{p:number}> = ({p}) => {
  const phases = [
    ['Noise', '□ ░ ? fragment ? ░ □'],
    ['Draft', 'Ein Modell erzeugt erst einen groben Entwurf.'],
    ['Kritik', 'Struktur prüfen, Fehler entfernen, Kontext schärfen.'],
    ['Final', 'Ein sauberer Text entsteht durch iterative Revision.'],
  ];
  return (
    <div style={{position:'absolute', left:850, top:205, width:910, height:610}}>
      {phases.map(([name,body],i)=>{
        const a=clamp01((p-i*0.18)/0.22);
        return <div key={name} style={{...panel, position:'absolute', left:80+i*35, top:55+i*105, width:700, minHeight:82, padding:'24px 30px', opacity:a, transform:`translateX(${(1-a)*60}px)`}}>
          <div style={{fontSize:24, color:i===0?'#fda4af':i===3?'#86efac':'#67e8f9', fontWeight:950, marginBottom:8}}>{name}</div>
          <div style={{fontSize:29, lineHeight:1.2}}>{body}</div>
        </div>
      })}
    </div>
  )
};

const SummaryVisual: React.FC<{p:number}> = ({p}) => (
  <div style={{position:'absolute', left:830, top:220, width:960, height:570}}>
    <div style={{position:'absolute', left:170, top:55, width:560, height:18, borderRadius:99, background:'rgba(255,255,255,0.3)'}} />
    <div style={{position:'absolute', left:438, top:38, width:24, height:330, borderRadius:99, background:'rgba(255,255,255,0.28)'}} />
    <div style={{...panel, position:'absolute', left:90, top:120, width:300, height:140, display:'grid', placeItems:'center', fontSize:32, fontWeight:950, transform:`translateY(${Math.sin(p*Math.PI*2)*16}px)`}}>Transformer</div>
    <div style={{...panel, position:'absolute', right:90, top:120, width:300, height:140, display:'grid', placeItems:'center', fontSize:32, fontWeight:950, transform:`translateY(${Math.cos(p*Math.PI*2)*16}px)`}}>Diffusion</div>
    {['Text → Transformer','Bild → Diffusion','Hybrid → DiT'].map((x,i)=>{
      const a=clamp01((p-0.24-i*0.12)/0.18);
      return <div key={x} style={{...tag, position:'absolute', left:260, top:340+i*72, opacity:a, width:440, color:i===0?'#67e8f9':i===1?'#fda4af':'#fbbf24'}}>✓ {x}</div>
    })}
  </div>
);

const MultimodalVisual: React.FC<{p:number}> = ({p}) => {
  const items = ['Text','Bild','Audio','Video','3D'];
  return <div style={{position:'absolute', left:850, top:220, width:930, height:570}}>
    <div style={{...panel, position:'absolute', left:270, top:180, width:320, height:160, display:'grid', placeItems:'center', fontSize:40, fontWeight:950, textAlign:'center'}}>Gemeinsamer<br/>Latent Space</div>
    {items.map((x,i)=>{
      const angle=(i/items.length)*Math.PI*2 + p*Math.PI*2;
      const a=clamp01((p-i*0.06)/0.2);
      return <div key={x} style={{...tag, position:'absolute', left:420+Math.cos(angle)*300, top:235+Math.sin(angle)*210, opacity:a, color:['#67e8f9','#fda4af','#c4b5fd','#86efac','#fbbf24'][i]}}>{x}</div>
    })}
  </div>
};

const Visual: React.FC<{index:number; p:number; frame:number}> = ({index,p,frame}) => {
  switch(index){
    case 0: return <TitleOverview p={p}/>;
    case 1: return <AttentionLive p={p} frame={frame}/>;
    case 2: return <ArchitectureBlocks p={p}/>;
    case 3: return <ArchitectureBlocks p={p} decoder/>;
    case 4: return <TokenPrediction p={p}/>;
    case 5: return <TokenPrediction p={p} masked/>;
    case 6: return <DiffusionImage p={p}/>;
    case 7: return <DiffusionImage p={p} reverse/>;
    case 8: return <DiffusionImage p={Math.abs(Math.sin(p*Math.PI))} slider/>;
    case 9: return <UNetVisual p={p}/>;
    case 10: return <UNetVisual p={p} prompt/>;
    case 11: return <PipelineVisual p={p}/>;
    case 12: return <Thumbnails p={p}/>;
    case 13: return <SortingVisual p={p}/>;
    case 14: return <MatrixVisual p={p}/>;
    case 15: return <TradeOffVisual p={p}/>;
    case 16: return <HybridVisual p={p}/>;
    case 17: return <MultimodalVisual p={p}/>;
    case 18: return <TextRevisionVisual p={p}/>;
    default: return <SummaryVisual p={p}/>;
  }
};

export const ExplainerVideo: React.FC<{request: RenderRequest}> = ({request}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const totalScenes = Math.max(1, request.scenes.length);
  const sceneLength = durationInFrames / totalScenes;
  const sceneIndex = Math.min(totalScenes - 1, Math.floor(frame / sceneLength));
  const scene = request.scenes[sceneIndex];
  const localFrame = frame - sceneIndex * sceneLength;
  const p = clamp01(localFrame / sceneLength);
  const appear = spring({frame: localFrame, fps, config: {damping: 18, stiffness: 95}});
  const fadeOut = interpolate(localFrame, [sceneLength - 18, sceneLength], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={bg}>
      <div style={grid} />
      <div style={{position:'absolute', left:-160, top:-120, width:460, height:460, borderRadius:999, background:'rgba(34,211,238,0.22)', filter:'blur(42px)'}} />
      <div style={{position:'absolute', right:-180, bottom:-160, width:560, height:560, borderRadius:999, background:'rgba(244,114,182,0.18)', filter:'blur(52px)'}} />

      <SceneHeading title={scene.title} text={scene.text} appear={appear} fade={fadeOut} />
      <div style={{opacity: fadeOut}}>
        <Visual index={sceneIndex} p={p} frame={frame} />
      </div>

      <div style={{position:'absolute', left:80, right:80, top:38, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:24, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,0.64)', fontWeight:900}}>
        <span>{request.title}</span>
        <span>Szene {sceneIndex + 1}/{totalScenes}</span>
      </div>

      <div style={{position:'absolute', left:80, right:80, bottom:58, height:14, borderRadius:99, background:'rgba(255,255,255,0.13)', overflow:'hidden'}}>
        <div style={{width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#22d3ee,#818cf8,#f472b6,#fbbf24)'}} />
      </div>
      <div style={{position:'absolute', left:80, bottom:88, fontSize:25, color:'rgba(255,255,255,0.58)'}}>
        {request.subtitle} · {Math.round(progress)}%
      </div>
    </AbsoluteFill>
  );
};
