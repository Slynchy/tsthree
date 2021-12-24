import { IData } from "../engine/Types/IData";

export const tsthreeConfig: {
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
  maintainResolution: boolean; // if true, continue using config resolution even if canvas size changes
  gamePlatform: "none" | "facebook",
  getLatestData: (e: IData[]) => IData
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
  devicePixelRatio: window.devicePixelRatio || 1,
  autoResize: "height",
  maintainResolution: true,
  gamePlatform: "none",
  getLatestData: e => {
    return e[0];
  }
};
