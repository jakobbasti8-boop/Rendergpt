export type Scene = {
  title: string;
  text: string;
  accent?: string;
};

export type RenderRequest = {
  title: string;
  subtitle: string;
  durationSeconds: number;
  fps: number;
  outputName: string;
  style: string;
  scenes: Scene[];
};
