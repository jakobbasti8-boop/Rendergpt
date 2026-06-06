import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {RenderRequest} from './types';

const container: React.CSSProperties = {
  background: 'radial-gradient(circle at 20% 20%, #20345f 0%, #111827 40%, #050816 100%)',
  color: 'white',
  fontFamily: 'Inter, Arial, Helvetica, sans-serif',
  overflow: 'hidden',
};

const grid: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
  backgroundSize: '80px 80px',
  opacity: 0.55,
};

const glowBase: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 999,
  filter: 'blur(50px)',
  opacity: 0.42,
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
  const fadeOut = interpolate(localFrame, [sceneLength - 15, sceneLength], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const drift = interpolate(frame, [0, durationInFrames], [0, 360]);

  return (
    <AbsoluteFill style={container}>
      <div style={grid} />
      <div
        style={{
          ...glowBase,
          width: 520,
          height: 520,
          left: 90 + Math.sin(drift / 70) * 70,
          top: 85,
          background: '#4f46e5',
        }}
      />
      <div
        style={{
          ...glowBase,
          width: 620,
          height: 620,
          right: -90,
          bottom: -120,
          background: '#06b6d4',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontSize: 24,
          color: 'rgba(255,255,255,0.68)',
        }}
      >
        <span>{request.style}</span>
        <span>{Math.round(progress)}%</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          top: 165,
          bottom: 155,
          display: 'flex',
          gap: 56,
          alignItems: 'center',
          opacity: fadeOut,
        }}
      >
        <div style={{flex: 1.05}}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.02,
              fontWeight: 900,
              transform: `translateY(${(1 - appear) * 55}px)`,
              opacity: appear,
              textShadow: '0 24px 80px rgba(0,0,0,0.55)',
            }}
          >
            {scene.title}
          </div>
          <div
            style={{
              marginTop: 34,
              fontSize: 42,
              lineHeight: 1.28,
              color: 'rgba(255,255,255,0.88)',
              transform: `translateY(${(1 - appear) * 70}px)`,
              opacity: appear,
              maxWidth: 930,
            }}
          >
            {scene.text}
          </div>
        </div>

        <div
          style={{
            width: 560,
            height: 560,
            position: 'relative',
            transform: `scale(${0.86 + appear * 0.14})`,
            opacity: appear,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 30,
              borderRadius: 46,
              border: '3px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.08)',
              boxShadow: '0 40px 120px rgba(0,0,0,0.42)',
              transform: `rotate(${sceneIndex % 2 === 0 ? -4 : 4}deg)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 88,
              right: 88,
              top: 90,
              height: 18,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.78)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 88,
              right: 138,
              top: 150,
              height: 18,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.42)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 88,
              right: 230,
              top: 210,
              height: 18,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.26)',
            }}
          />
          {Array.from({length: 10}).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 20 + (i % 3) * 12,
                height: 20 + (i % 3) * 12,
                borderRadius: 999,
                left: 120 + Math.cos((frame + i * 30) / 35) * (110 + i * 8),
                top: 330 + Math.sin((frame + i * 25) / 30) * (70 + i * 3),
                background: 'rgba(255,255,255,0.72)',
                boxShadow: '0 0 30px rgba(125,211,252,0.65)',
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              left: 150,
              right: 150,
              bottom: 72,
              height: 70,
              borderRadius: 24,
              background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            LLM
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          bottom: 68,
          height: 16,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.16)',
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
          left: 90,
          bottom: 98,
          fontSize: 30,
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        {request.title} — {request.subtitle}
      </div>
    </AbsoluteFill>
  );
};
