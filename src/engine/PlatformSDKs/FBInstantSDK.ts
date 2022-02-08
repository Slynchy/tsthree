import { PlatformSDK } from "./PlatformSDK";
import { IPlayerInfo } from "../Types/IPlayerInfo";
import { HelperFunctions } from "../HelperFunctions";
import { AD_TYPE } from "../Types/AdType";
import { ICreateTournamentConfig } from "../Types/ICreateTournamentConfig";
import { ITournament } from "../Types/ITournament";

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

enum FBSDK_ERROR_CODES {
    UserClosedPopup = "USER_INPUT",
    SameContext = "SAME_CONTEXT",
}

interface IFBError {
    code: FBSDK_ERROR_CODES | string,
    message: string
}

export class FBInstantSDK extends PlatformSDK {

    private _contextCache: IContextCache = {
        id: "",
        type: ContextType.SOLO // assume solo then correct later
    };

    constructor() {
        super();
    }

    /**
     * {code:'CLIENT_UNSUPPORTED_OPERATION',message:'Client does not support no player IDS or multiple player IDs yet'}
     * @param _suggestedPlayerID
     */
    public createContext(_suggestedPlayerID: string /*| Array<string> | null*/): Promise<void> {
        return FBInstant.context.createAsync(
            // @ts-ignore
            _suggestedPlayerID
        ).then(() => {
            this._contextCache.id = _suggestedPlayerID;
            this._contextCache.type = ContextType.THREAD;
        });
    };

    public createTournamentAsync(_config: {
        initialScore: number,
        data?: { [key: string]: unknown },
        config: ICreateTournamentConfig
    }): Promise<ITournament | null> {
        return (FBInstant.tournament.createAsync(_config) as Promise<ITournament>)
            .catch((err: IFBError) => {
                if (err.code === FBSDK_ERROR_CODES.UserClosedPopup) {
                    return null;
                } else {
                    console.error(err);
                }
            });
    }

    public addOnPauseCallback(cb: Function): void {
        return FBInstant.onPause(() => cb());
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
        return this._contextCache.id || (this._contextCache.id = FBInstant.context.getID());
    }

    public getContextType(): string {
        return this._contextCache.type || (this._contextCache.type = FBInstant.context.getType() as ContextType);
    }

    public getPlayerId(): string {
        return FBInstant.player.getID();
    }

    public getEntryPointData(): { [key: string]: unknown } {
        return FBInstant.getEntryPointData();
    }

    public submitTournamentScoreAsync(_score: number): Promise<void> {
        return FBInstant.tournament.postScoreAsync(_score);
    };

    public getEntryPointAsync(): Promise<string> {
        return FBInstant.getEntryPointAsync();
    }

    public shareTournamentAsync(_config: { score: number, data?: { [key: string]: any } }): Promise<void> {
        return FBInstant.tournament.shareAsync(_config);
    }

    public switchContext(_id: string): Promise<boolean> {
        return FBInstant.context.switchAsync(_id)
            .catch((err: Error & { code: FBSDK_ERROR_CODES }) => {
                switch (err.code) {
                    case FBSDK_ERROR_CODES.UserClosedPopup:
                        // don't care
                        break;
                    case FBSDK_ERROR_CODES.SameContext:
                        console.warn("User attempted to switch to the current context");
                        break;
                    default:
                        console.error("Failed to switch context ", err);
                        break;
                }
                return false;
            })
            .then(() => {
                const newID = FBInstant.context.getID();
                this._contextCache.id = newID;
                this._contextCache.type = FBInstant.context.getType() as ContextType;
                return (newID === _id);
            });
    }

    public getTournamentsAsync(): Promise<ITournament[]> {
        return FBInstant.tournament.getTournamentsAsync() as Promise<ITournament[]>;
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

    public getTournamentAsync(): Promise<ITournament> {
        return FBInstant.getTournamentAsync() as unknown as Promise<ITournament>;
    }

}
