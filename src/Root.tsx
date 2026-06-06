import React from 'react';
import {Composition} from 'remotion';
import {ExplainerVideo} from './Video';
import request from '../render-requests/current.json';
import type {RenderRequest} from './types';

const config = request as RenderRequest;

export const Root: React.FC = () => {
  const fps = config.fps || 30;
  const durationSeconds = config.durationSeconds || 30;

  return (
    <Composition
      id="ExplainerVideo"
      component={ExplainerVideo}
      durationInFrames={durationSeconds * fps}
      fps={fps}
      width={1920}
      height={1080}
      defaultProps={{request: config}}
    />
  );
};
