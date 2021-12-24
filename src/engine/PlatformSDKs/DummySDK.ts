import { PlatformSDK } from "./PlatformSDK";
import { IPlayerInfo } from "../Types/IPlayerInfo";
import { DEFAULT_TEXTURE_B64 } from "../Constants/Constants";
import { AD_TYPE } from "../Types/AdType";

export class DummySDK extends PlatformSDK {
    constructor() {
        super();
    }

    public setLoadingProgress(_progress: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    public initialize(): Promise<void> {
        return Promise.resolve(undefined);
    }

    public startGame(): Promise<void> {
        return Promise.resolve(undefined);
    }

    public getContextId(): string {
        return "4321";
    }

    public getContextType(): string {
        return "SOLO";
    }

    public getPlayerId(): string {
        return "1234";
    }

    public async getAdvertisementInstance(_type: AD_TYPE, _placementId: string): Promise<FBInstant.AdInstance> {
        return {
            loadAsync(): Promise<void> {
                return Promise.resolve();
            },
            showAsync(): Promise<void> {
                return Promise.resolve();
            }
        } as FBInstant.AdInstance;
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
        return "TEST";
    }

    public getPlayerPicUrl(): string {
        return DEFAULT_TEXTURE_B64;
    }

    public flush(): Promise<void> {
        return Promise.resolve(undefined);
    }

    public load(): Promise<Record<string, unknown>> {
        return Promise.resolve({});
    }

    public save(_data: Record<string, unknown>): Promise<void> {
        return Promise.resolve(undefined);
    }

    isReady(): boolean {
        return true;
    }

    hideBannerAd(_placementId: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    showBannerAd(_placementId: string): Promise<void> {
        return Promise.resolve(undefined);
    }

}
