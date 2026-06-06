import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {RenderRequest} from './types';

const bg: React.CSSProperties = {
  background:
    'radial-gradient(circle at 18% 18%, #1e3a8a 0%, #111827 40%, #020617 100%)',
  color: 'white',
  fontFamily: 'Inter, Arial, Helvetica, sans-serif',
  overflow: 'hidden',
};

const grid: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
  backgroundSize: '70px 70px',
  opacity: 0.44,
};

const card: React.CSSProperties = {
  borderRadius: 34,
  border: '2px solid rgba(255,255,255,0.17)',
  background: 'rgba(15,23,42,0.72)',
  boxShadow: '0 28px 90px rgba(0,0,0,0.42)',
};

const chip: React.CSSProperties = {
  borderRadius: 999,
  padding: '12px 22px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.09)',
  fontSize: 25,
  fontWeight: 800,
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const appearBetween = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const noiseTokens = ['#9x', '??', 'u7', 'Δ', '##', 'x0', '░░', '0?', 'λ', '...'];
const sentenceTokens = [
  'Diffusion',
  'startet',
  'mit',
  'einem',
  'groben',
  'Antwort-Entwurf',
  'und',
  'entfernt',
  'Fehler',
  'Schritt',
  'für',
  'Schritt',
];

const topLabel = (text: string, right: string) => (
  <div
    style={{
      position: 'absolute',
      left: 74,
      right: 74,
      top: 48,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.64)',
      fontSize: 23,
      fontWeight: 800,
    }}
  >
    <span>{text}</span>
    <span>{right}</span>
  </div>
);

const Arrow: React.FC<{left: number; top: number; opacity?: number}> = ({left, top, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      opacity,
      fontSize: 58,
      fontWeight: 900,
      color: 'rgba(255,255,255,0.72)',
      textShadow: '0 0 35px rgba(34,211,238,0.55)',
    }}
  >
    →
  </div>
);

const TitleBlock: React.FC<{
  title: string;
  text: string;
  localFrame: number;
  fps: number;
}> = ({title, text, localFrame, fps}) => {
  const pop = spring({frame: localFrame, fps, config: {damping: 18, stiffness: 120}});
  return (
    <div
      style={{
        position: 'absolute',
        left: 74,
        right: 74,
        top: 112,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 48,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          fontSize: 62,
          lineHeight: 1,
          fontWeight: 950,
          maxWidth: 820,
          opacity: pop,
          transform: `translateY(${(1 - pop) * 34}px)`,
          textShadow: '0 25px 80px rgba(0,0,0,0.58)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...card,
          maxWidth: 780,
          padding: '24px 30px',
          fontSize: 30,
          lineHeight: 1.22,
          color: 'rgba(255,255,255,0.87)',
          opacity: pop,
          transform: `translateY(${(1 - pop) * 28}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const NoiseToMeaning: React.FC<{localFrame: number; fps: number}> = ({localFrame, fps}) => {
  const p = appearBetween(localFrame, 8, fps * 5.1);
  const promptIn = appearBetween(localFrame, 0, 18);
  const finalIn = appearBetween(localFrame, fps * 3.2, fps * 4.8);

  return (
    <div style={{position: 'absolute', left: 88, right: 88, top: 325, bottom: 100}}>
      <div
        style={{
          ...card,
          position: 'absolute',
          left: 0,
          top: 42,
          width: 420,
          height: 420,
          padding: 34,
          opacity: promptIn,
          transform: `scale(${0.94 + promptIn * 0.06})`,
        }}
      >
        <div style={{...chip, display: 'inline-block'}}>Prompt</div>
        <div style={{fontSize: 37, lineHeight: 1.2, marginTop: 42, fontWeight: 900}}>
          „Erkläre Diffusion-LLMs einfach.“
        </div>
        <div style={{fontSize: 26, color: 'rgba(255,255,255,0.58)', marginTop: 36}}>
          Eingabe wird in einen latenten Arbeitsraum übersetzt.
        </div>
      </div>

      <Arrow left={465} top={215} opacity={promptIn} />

      <div
        style={{
          ...card,
          position: 'absolute',
          left: 565,
          top: 0,
          width: 640,
          height: 520,
          padding: 30,
          overflow: 'hidden',
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{...chip}}>Verrauschter Entwurf</div>
          <div style={{fontSize: 28, color: 'rgba(255,255,255,0.62)'}}>
            Denoising {Math.round(p * 100)}%
          </div>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 15, marginTop: 44}}>
          {sentenceTokens.map((word, i) => {
            const reveal = clamp01((p * sentenceTokens.length - i) / 1.6);
            const text = reveal > 0.45 ? word : noiseTokens[(i + Math.floor(localFrame / 6)) % noiseTokens.length];
            return (
              <div
                key={word + i}
                style={{
                  borderRadius: 18,
                  padding: '13px 17px',
                  minWidth: 78,
                  textAlign: 'center',
                  fontSize: reveal > 0.45 ? 25 : 29,
                  fontWeight: 900,
                  color: reveal > 0.45 ? 'white' : 'rgba(255,255,255,0.52)',
                  background: reveal > 0.45 ? 'rgba(34,211,238,0.22)' : 'rgba(255,255,255,0.08)',
                  border: reveal > 0.45 ? '1px solid rgba(34,211,238,0.6)' : '1px solid rgba(255,255,255,0.14)',
                  transform: `translateY(${(1 - reveal) * 18}px) scale(${0.88 + reveal * 0.12})`,
                  boxShadow: reveal > 0.45 ? '0 0 34px rgba(34,211,238,0.22)' : 'none',
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 42,
            height: 18,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${p * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f472b6, #22d3ee)',
            }}
          />
        </div>
      </div>

      <Arrow left={1242} top={215} opacity={finalIn} />

      <div
        style={{
          ...card,
          position: 'absolute',
          right: 0,
          top: 42,
          width: 480,
          height: 420,
          padding: 34,
          opacity: finalIn,
          transform: `translateX(${(1 - finalIn) * 45}px) scale(${0.93 + finalIn * 0.07})`,
        }}
      >
        <div style={{...chip, display: 'inline-block'}}>Antwort</div>
        <div style={{fontSize: 35, lineHeight: 1.2, marginTop: 34, fontWeight: 900}}>
          „Erst entsteht ein grober Text. Dann wird er mehrfach korrigiert, bis Inhalt und Struktur passen.“
        </div>
      </div>
    </div>
  );
};

const DenoisingPipeline: React.FC<{localFrame: number; fps: number}> = ({localFrame, fps}) => {
  const labels = [
    {title: '1 Noise', body: '## ? solar falsch ...'},
    {title: '2 Rohentwurf', body: 'Diffusion nutzt Schritte.'},
    {title: '3 Struktur', body: 'Definition → Ablauf → Nutzen'},
    {title: '4 Finale Fassung', body: 'Sauberer, konsistenter Text'},
  ];
  const p = appearBetween(localFrame, 0, fps * 5.6);

  return (
    <div style={{position: 'absolute', left: 88, right: 88, top: 330, bottom: 105}}>
      {labels.map((item, i) => {
        const step = clamp01((p * labels.length - i) / 0.85);
        return (
          <React.Fragment key={item.title}>
            <div
              style={{
                ...card,
                position: 'absolute',
                left: i * 440,
                top: 50 + Math.sin((localFrame + i * 25) / 18) * 7,
                width: 360,
                height: 405,
                padding: 30,
                opacity: 0.35 + step * 0.65,
                transform: `scale(${0.92 + step * 0.08})`,
              }}
            >
              <div style={{fontSize: 34, fontWeight: 950}}>{item.title}</div>
              <div
                style={{
                  marginTop: 34,
                  minHeight: 124,
                  borderRadius: 22,
                  background: i === 0 ? 'rgba(244,114,182,0.16)' : 'rgba(34,211,238,0.15)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  padding: 22,
                  fontSize: 29,
                  lineHeight: 1.18,
                  fontWeight: 850,
                }}
              >
                {item.body}
              </div>
              <div style={{marginTop: 32, display: 'grid', gap: 11}}>
                {Array.from({length: 5}).map((_, row) => {
                  const clean = clamp01(step - row * 0.08);
                  return (
                    <div
                      key={row}
                      style={{
                        height: 16,
                        width: `${45 + clean * 45 + row * 5}%`,
                        borderRadius: 999,
                        background: clean > 0.5 ? 'rgba(34,211,238,0.65)' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
            {i < labels.length - 1 ? <Arrow left={i * 440 + 374} top={214} opacity={0.35 + step * 0.65} /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ComparisonScene: React.FC<{localFrame: number; fps: number}> = ({localFrame, fps}) => {
  const p = appearBetween(localFrame, 0, fps * 5.4);
  const tokens = ['Der', 'Text', 'wächst', 'Token', 'für', 'Token'];
  const draft = ['Grobe', 'Antwort', 'wird', 'parallel', 'überarbeitet'];

  return (
    <div style={{position: 'absolute', left: 92, right: 92, top: 325, bottom: 104, display: 'flex', gap: 48}}>
      <div style={{...card, flex: 1, padding: 36, position: 'relative'}}>
        <div style={{fontSize: 42, fontWeight: 950}}>Klassischer Transformer</div>
        <div style={{fontSize: 27, color: 'rgba(255,255,255,0.62)', marginTop: 10}}>Autoregressiv: nächstes Token wird angehängt.</div>
        <div style={{display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 72}}>
          {tokens.map((token, i) => {
            const show = p > i / tokens.length;
            return (
              <div
                key={token}
                style={{
                  borderRadius: 17,
                  padding: '18px 22px',
                  fontSize: 31,
                  fontWeight: 900,
                  background: show ? 'rgba(129,140,248,0.27)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  opacity: show ? 1 : 0.22,
                  transform: `translateY(${show ? 0 : 28}px)`,
                }}
              >
                {show ? token : '· · ·'}
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 36, right: 36, bottom: 44, fontSize: 30, color: 'rgba(255,255,255,0.76)'}}>
          Vorteil: sehr stark beim Fortsetzen. Grenze: frühe Fehler ziehen oft alles nach.
        </div>
      </div>

      <div style={{...card, flex: 1, padding: 36, position: 'relative'}}>
        <div style={{fontSize: 42, fontWeight: 950}}>Diffusion-LLM</div>
        <div style={{fontSize: 27, color: 'rgba(255,255,255,0.62)', marginTop: 10}}>Revision: der ganze Entwurf wird gleichzeitig sauberer.</div>
        <div style={{display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 72}}>
          {draft.map((token, i) => {
            const clean = clamp01((p * 1.35) - i * 0.08);
            return (
              <div
                key={token}
                style={{
                  borderRadius: 17,
                  padding: '18px 22px',
                  fontSize: 31,
                  fontWeight: 900,
                  background: clean > 0.65 ? 'rgba(34,211,238,0.27)' : 'rgba(244,114,182,0.15)',
                  border: clean > 0.65 ? '1px solid rgba(34,211,238,0.62)' : '1px solid rgba(244,114,182,0.42)',
                  filter: clean > 0.65 ? 'blur(0px)' : 'blur(1.4px)',
                  transform: `scale(${0.93 + clean * 0.07})`,
                }}
              >
                {clean > 0.65 ? token : noiseTokens[(i + Math.floor(localFrame / 5)) % noiseTokens.length]}
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 36, right: 36, bottom: 44, fontSize: 30, color: 'rgba(255,255,255,0.76)'}}>
          Vorteil: globale Struktur kann vor der finalen Formulierung korrigiert werden.
        </div>
      </div>
    </div>
  );
};

const StructureScene: React.FC<{localFrame: number; fps: number}> = ({localFrame, fps}) => {
  const p = appearBetween(localFrame, 0, fps * 5.5);
  const nodes = ['Ziel', 'Gliederung', 'Absatz 1', 'Absatz 2', 'Fazit'];

  return (
    <div style={{position: 'absolute', left: 96, right: 96, top: 330, bottom: 96}}>
      <div style={{...card, position: 'absolute', left: 0, top: 30, width: 700, height: 450, padding: 38}}>
        <div style={{fontSize: 42, fontWeight: 950}}>Beispiel: langer Erklärungstext</div>
        <div style={{fontSize: 28, color: 'rgba(255,255,255,0.65)', marginTop: 14}}>Nicht nur der nächste Satz zählt, sondern die Gesamtlogik.</div>
        <div style={{marginTop: 40, display: 'grid', gap: 18}}>
          {nodes.map((node, i) => {
            const a = clamp01((p * nodes.length - i) / 0.9);
            return (
              <div key={node} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: 0.3 + a * 0.7}}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background: a > 0.55 ? 'rgba(34,211,238,0.72)' : 'rgba(255,255,255,0.14)',
                    boxShadow: a > 0.55 ? '0 0 30px rgba(34,211,238,0.42)' : 'none',
                  }}
                />
                <div style={{fontSize: 32, fontWeight: 900}}>{node}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{...card, position: 'absolute', right: 0, top: 0, width: 850, height: 505, padding: 38}}>
        <div style={{fontSize: 40, fontWeight: 950}}>Animierte Revision</div>
        <div style={{marginTop: 36, display: 'grid', gap: 18}}>
          {[
            '1. Entwurf enthält Wiederholungen und Lücken.',
            '2. Modell erkennt Konflikte über den gesamten Text.',
            '3. Abschnitte werden synchron verbessert.',
            '4. Finale Antwort wirkt konsistenter.',
          ].map((line, i) => {
            const done = clamp01((p * 4.6 - i) / 1.1);
            return (
              <div
                key={line}
                style={{
                  borderRadius: 22,
                  padding: '19px 24px',
                  fontSize: 29,
                  fontWeight: 850,
                  background: done > 0.55 ? 'rgba(34,211,238,0.18)' : 'rgba(255,255,255,0.07)',
                  border: done > 0.55 ? '1px solid rgba(34,211,238,0.45)' : '1px solid rgba(255,255,255,0.13)',
                  transform: `translateX(${(1 - done) * 32}px)`,
                  opacity: 0.35 + done * 0.65,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LoopScene: React.FC<{localFrame: number; fps: number}> = ({localFrame, fps}) => {
  const p = appearBetween(localFrame, 0, fps * 5.5);
  const angle = p * Math.PI * 2 * 1.15 - Math.PI / 2;
  const cx = 960;
  const cy = 595;
  const r = 230;
  const dotX = cx + Math.cos(angle) * r;
  const dotY = cy + Math.sin(angle) * r;
  const nodes = [
    {label: 'Noise', x: cx, y: cy - r},
    {label: 'Draft', x: cx + r, y: cy},
    {label: 'Kritik', x: cx, y: cy + r},
    {label: 'Final', x: cx - r, y: cy},
  ];

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{...card, position: 'absolute', left: 150, top: 355, width: 470, height: 360, padding: 34}}>
        <div style={{fontSize: 36, fontWeight: 950}}>Vorher</div>
        <div style={{fontSize: 32, lineHeight: 1.2, marginTop: 36, color: 'rgba(255,255,255,0.65)'}}>
          „Diffusion macht Text irgendwie besser...“
        </div>
      </div>

      <div style={{...card, position: 'absolute', right: 150, top: 355, width: 470, height: 360, padding: 34}}>
        <div style={{fontSize: 36, fontWeight: 950}}>Nachher</div>
        <div style={{fontSize: 32, lineHeight: 1.2, marginTop: 36, color: 'rgba(255,255,255,0.92)'}}>
          „Das Modell entfernt Rauschen, prüft Struktur und verfeinert den gesamten Entwurf.“
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: 999,
          border: '4px dashed rgba(255,255,255,0.22)',
          boxShadow: '0 0 80px rgba(34,211,238,0.18)',
        }}
      />
      {nodes.map((node, i) => (
        <div
          key={node.label}
          style={{
            position: 'absolute',
            left: node.x - 72,
            top: node.y - 36,
            width: 144,
            height: 72,
            borderRadius: 24,
            background: 'rgba(15,23,42,0.92)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 25,
            fontWeight: 950,
            transform: `scale(${1 + Math.sin((localFrame + i * 20) / 18) * 0.035})`,
          }}
        >
          {node.label}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: dotX - 18,
          top: dotY - 18,
          width: 36,
          height: 36,
          borderRadius: 999,
          background: '#22d3ee',
          boxShadow: '0 0 45px rgba(34,211,238,0.9)',
        }}
      />
    </div>
  );
};

export const ExplainerVideo: React.FC<{request: RenderRequest}> = ({request}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const visualScenes = 5;
  const sceneLength = durationInFrames / visualScenes;
  const sceneIndex = Math.min(visualScenes - 1, Math.floor(frame / sceneLength));
  const localFrame = frame - sceneIndex * sceneLength;
  const scene = request.scenes[sceneIndex] ?? request.scenes[0];
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sceneOpacity = interpolate(localFrame, [sceneLength - 12, sceneLength], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={bg}>
      <div style={grid} />
      <div
        style={{
          position: 'absolute',
          width: 650,
          height: 650,
          left: -120 + Math.sin(frame / 45) * 40,
          top: -160,
          borderRadius: 999,
          background: '#4f46e5',
          filter: 'blur(80px)',
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 720,
          height: 720,
          right: -170,
          bottom: -210,
          borderRadius: 999,
          background: '#06b6d4',
          filter: 'blur(90px)',
          opacity: 0.3,
        }}
      />

      {topLabel(request.style, `${Math.round(progress)}%`)}
      <TitleBlock title={scene.title} text={scene.text} localFrame={localFrame} fps={fps} />

      <div style={{opacity: sceneOpacity}}>
        {sceneIndex === 0 ? <NoiseToMeaning localFrame={localFrame} fps={fps} /> : null}
        {sceneIndex === 1 ? <DenoisingPipeline localFrame={localFrame} fps={fps} /> : null}
        {sceneIndex === 2 ? <ComparisonScene localFrame={localFrame} fps={fps} /> : null}
        {sceneIndex === 3 ? <StructureScene localFrame={localFrame} fps={fps} /> : null}
        {sceneIndex === 4 ? <LoopScene localFrame={localFrame} fps={fps} /> : null}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 74,
          right: 74,
          bottom: 50,
          height: 15,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.14)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #22d3ee, #818cf8, #f472b6)',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 74,
          bottom: 76,
          fontSize: 27,
          color: 'rgba(255,255,255,0.56)',
          fontWeight: 700,
        }}
      >
        {request.title} — animierte Beispielversion
      </div>
    </AbsoluteFill>
  );
};
