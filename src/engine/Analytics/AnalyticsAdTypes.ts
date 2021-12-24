import { AD_TYPE } from "../Types/AdType";

export const ANALYTICS_AD_TYPES: { [key: number]: string } = {
    [AD_TYPE.INTERSTITIAL]: "interstitial",
    [AD_TYPE.REWARDED]: "rewarded",
    [AD_TYPE.BANNER]: "banner",
}
