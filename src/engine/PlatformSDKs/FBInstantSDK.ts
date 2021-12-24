import { PlatformSDK } from "./PlatformSDK";
import { IPlayerInfo } from "../Types/IPlayerInfo";
import { HelperFunctions } from "../HelperFunctions";
import { AD_TYPE } from "../Types/AdType";

interface IContextCache {
    id: string;
    type: ContextType;
}

enum ContextType {
    POST = "POST",
    THREAD = "THREAD",
    GROUP = "GROUP",
    SOLO = "SOLO"
}

export class FBInstantSDK extends PlatformSDK {

    private _contextCache: IContextCache = {
        id: "",
        type: ContextType.SOLO // assume solo then correct later
    };

    constructor() {
        super();
    }

    public setLoadingProgress(_progress: number): Promise<void> {
        return Promise.resolve(FBInstant.setLoadingProgress(_progress));
    }

    public async initialize(): Promise<void> {
        if (!this.isReady())
            await HelperFunctions.waitForTruth(() => this.isReady(), 33);
        return FBInstant.initializeAsync();
    }

    public startGame(): Promise<void> {
        return FBInstant.startGameAsync();
    }

    public getContextId(): string {
        return this._contextCache.id;
    }

    public getContextType(): string {
        return this._contextCache.id;
    }

    public getPlayerId(): string {
        return FBInstant.player.getID();
    }

    public getPlayerInfo(): IPlayerInfo {
        return {
            playerId: this.getPlayerId(),
            contextId: this.getContextId(),
            contextType: this.getContextType(),
            playerPicUrl: this.getPlayerPicUrl(),
            playerName: this.getPlayerName(),
        };
    }

    public getPlayerName(): string {
        return FBInstant.player.getName();
    }

    public getPlayerPicUrl(): string {
        return FBInstant.player.getPhoto();
    }

    public flush(): Promise<void> {
        return FBInstant.player.flushDataAsync();
    }

    public showBannerAd(_placementId: string): Promise<void> {
        return FBInstant.loadBannerAdAsync(_placementId);
    }

    public hideBannerAd(_placementId: string): Promise<void> {
        return FBInstant.hideBannerAdAsync(_placementId);
    }

    public getAdvertisementInstance(_type: AD_TYPE, _placementId: string): Promise<FBInstant.AdInstance> {
        switch (_type) {
            case AD_TYPE.BANNER:
                throw new Error("Use other functions for banner ads");
            case AD_TYPE.INTERSTITIAL:
                return FBInstant.getInterstitialAdAsync(_placementId);
            case AD_TYPE.REWARDED:
                return FBInstant.getRewardedVideoAsync(_placementId);
        }
    }

    public load(_keys: Array<string> = []): Promise<Record<string, unknown>> {
        return FBInstant.player.getDataAsync(_keys);
    }

    public save(_data: Record<string, unknown>): Promise<void> {
        return FBInstant.player.setDataAsync(_data);
    }

    isReady(): boolean {
        return Boolean(window.FBInstant);
    }

}
