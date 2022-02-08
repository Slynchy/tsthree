import { FBInstantSDK } from "./PlatformSDKs/FBInstantSDK";
import { AD_TYPE } from "./Types/AdType";
import { AdIDs } from "./Constants/AdIDs";

const AD_TYPE_TO_PLACEMENT_ID: { [key: number]: string } = {
    [AD_TYPE.INTERSTITIAL]: AdIDs.Interstitial,
    [AD_TYPE.REWARDED]: AdIDs.Rewarded,
    [AD_TYPE.BANNER]: AdIDs.Banner,
}

export enum FBAdManagerErrorCodes {
    FAILED_TO_FETCH_INSTANCE = "Failed to fetch ad instance",
    FAILED_TO_LOAD_AD = "Failed to load from ad instance",
    FAILED_TO_SHOW_AD = "Failed to show ad instance",
    USER_INPUT = "USER_INPUT",
}

export class FBAdManager {

    private readonly _fbInstantSDKRef: FBInstantSDK;
    private readonly _adInstances: FBInstant.AdInstance[] = [];

    private readonly _interstitialRetries: number;
    private readonly _rewardedRetries: number;
    private readonly _bannerRetries: number;

    constructor(_config: {
        fbInstantSDKRef: FBInstantSDK,
        interstitialRetries: number,
        rewardedRetries: number,
        bannerRetries: number,
    }) {
        this._fbInstantSDKRef = _config.fbInstantSDKRef;
        this._adInstances.length = AD_TYPE.NUM_OF_AD_TYPES;
        this._interstitialRetries = _config.interstitialRetries;
        this._rewardedRetries = _config.rewardedRetries;
        this._bannerRetries = _config.bannerRetries;
    }

    public isAdInstanceAvailable(_type: AD_TYPE): boolean {
        return Boolean(this._adInstances[_type]);
    }

    public getNumberOfRetriesFromType(_type: AD_TYPE): number {
        switch (_type) {
            case AD_TYPE.BANNER:
                return this._bannerRetries;
            case AD_TYPE.INTERSTITIAL:
                return this._interstitialRetries;
            case AD_TYPE.REWARDED:
                return this._rewardedRetries;
        }
    }

    public async preloadAdInstance(_type: AD_TYPE, _placementId?: string): Promise<void> {
        if (this.isAdInstanceAvailable(_type)) return;

        let retryCounter = 0;
        const amountOfRetries = this.getNumberOfRetriesFromType(_type);
        const retry = async (): Promise<void> => {
            if (this._adInstances[_type]) return;
            if (retryCounter > amountOfRetries) {
                this._adInstances[_type] = null;
                throw new Error(FBAdManagerErrorCodes.FAILED_TO_FETCH_INSTANCE);
            }
            try {
                const PLACEMENT_ID = _placementId ||=
                    AD_TYPE_TO_PLACEMENT_ID[_type];
                this._adInstances[_type] = await this._fbInstantSDKRef.getAdvertisementInstance(_type, PLACEMENT_ID);
            } catch (err) {
                console.error(err);
                retryCounter++;
                return retry();
            }
        }

        return retry();
    }

    public async showAd(_type: AD_TYPE): Promise<void> {
        if (!this.isAdInstanceAvailable(_type)) {
            await this.preloadAdInstance(_type)
                .catch(
                    (err) => {
                        console.error(err);
                        this.preloadAdInstance(_type).catch((err) => {
                            console.error(err);
                        })
                    }
                );
        }

        let retryCounter = 0;
        const amountOfRetries = this.getNumberOfRetriesFromType(_type);
        const retryLoad = async () => {
            if (retryCounter > 3) {
                this._adInstances[_type] = null;
                throw new Error(FBAdManagerErrorCodes.FAILED_TO_LOAD_AD);
            }
            try {
                await this._adInstances[_type].loadAsync();
                retryCounter = 0;
            } catch (err) {
                console.error(err);
                retryCounter++;
                retryLoad();
            }
        }
        const retryShow = async (): Promise<void> => {
            if (retryCounter > amountOfRetries) {
                this._adInstances[_type] = null;
                throw new Error(FBAdManagerErrorCodes.FAILED_TO_SHOW_AD);
            }
            try {
                await this._adInstances[_type].showAsync();
            } catch (err) {
                if (err && err.code === "USER_INPUT")
                    return Promise.reject(FBAdManagerErrorCodes.USER_INPUT);
                console.error(err);
                retryCounter++;
                return retryShow();
            }
        }

        await retryLoad();
        return retryShow();
    }

}
