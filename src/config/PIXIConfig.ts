export const PIXIConfig: {
  width: number;
  height: number;
  transparent: boolean;
  backgroundColor: number;
  antialias: boolean;
  sharedTicker: boolean;
  sharedLoader: boolean;
  autoStart: boolean;
  defaultCameraType: "perspective" | "orthographic";
  devicePixelRatio: number;
  autoResize: "width" | "height" | "none";
} = {
  width: 720,
  height: 1280,
  transparent: false,
  backgroundColor: 0x101010,
  antialias: true,
  sharedTicker: true,
  sharedLoader: false,
  autoStart: false,
  defaultCameraType: "perspective",
  devicePixelRatio: window.devicePixelRatio,
  autoResize: "height",
};
