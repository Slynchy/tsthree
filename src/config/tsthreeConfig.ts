import { IData } from "../engine/Types/IData";
import { ENGINE_DEBUG_MODE } from "../engine/Constants/Constants";
import isMobile from "is-mobile";

export const tsthreeConfig: {
  width: number;
  height: number;
  scale3D: {
    mobile: number,
    desktop: number,
  }; // how much to scale the width/height for the 3D renderer
  transparent: boolean;
  showFPSTracker: boolean;
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
  autoSave: number | 0, // if !0, then save every specified milliseconds
  getLatestData: (e: IData[]) => IData,
  logErrors: boolean
} = {
  width: 720,
  height: 1280,
  scale3D: {
    mobile: 0.5,
    desktop: 0.75
  },
  showFPSTracker: ENGINE_DEBUG_MODE,
  transparent: false,
  backgroundColor: 0x9ec274,
  antialias: !(isMobile()),
  sharedTicker: true,
  sharedLoader: false,
  autoStart: false,
  defaultCameraType: "perspective",
  devicePixelRatio: window.devicePixelRatio || 1,
  autoResize: "height",
  maintainResolution: true,
  gamePlatform: "none",
  autoSave: 1000 * 15,
  logErrors: false,
  getLatestData: e => {
    return e[0];
  }
};
