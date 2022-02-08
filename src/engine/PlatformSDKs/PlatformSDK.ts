import { IPlayerInfo } from "../Types/IPlayerInfo";
import { AD_TYPE } from "../Types/AdType";
import { ITournament } from "../Types/ITournament";
import { ICreateTournamentConfig } from "../Types/ICreateTournamentConfig";

export abstract class PlatformSDK {
    protected constructor() { /* nope */
    }

    /**
     * Initializes the SDK. On FBInstant, this would *not* call `startGameAsync`
     */
    public abstract initialize(): Promise<void>;

    public abstract createContext(_suggestedPlayerID: string | Array<string> | null): Promise<void>;

    /**
     * This only exists because Facebook has a distinction between init and starting
     */
    public abstract startGame(): Promise<void>;

    /**
     * @param _progress The actual progress to set, not increment
     */
    public abstract setLoadingProgress(_progress: number): Promise<void>;

    public abstract addOnPauseCallback(cb: Function): void;

    /**
     * Gets all player info at once (for game start), not optimal for any other use
     */
    public abstract getPlayerInfo(): IPlayerInfo;

    public abstract getTournamentsAsync(): Promise<ITournament[]>

    public abstract getEntryPointAsync(): Promise<string>;

    public abstract getPlayerName(): string;

    public abstract getPlayerId(): string;

    public abstract getPlayerPicUrl(): string;

    public abstract getContextId(): string;

    public abstract getContextType(): string;

    public abstract submitTournamentScoreAsync(_score: number): Promise<void>;

    public abstract switchContext(_id: string): Promise<boolean>;

    public abstract shareTournamentAsync(_config: { score: number, data?: { [key: string]: any } }): Promise<void>;

    public abstract showBannerAd(_placementId: string): Promise<void>;

    public abstract hideBannerAd(_placementId: string): Promise<void>;

    public abstract getAdvertisementInstance(_type: AD_TYPE, _placementId: string): Promise<FBInstant.AdInstance>;

    public abstract getEntryPointData(): { [key: string]: unknown };

    public abstract getTournamentAsync(): Promise<ITournament>;

    public abstract createTournamentAsync(_config: {
        initialScore: number,
        data?: { [key: string]: unknown },
        config: ICreateTournamentConfig
    }): Promise<ITournament | null>;

    /*
        These functions should be pass-thru! A distinct class should handle saving/loading, all this
        class does is just link the function to the SDK
     */
    public abstract save(_data: Record<string, unknown>): Promise<void>;

    public abstract load(): Promise<Record<string, unknown>>;

    public abstract flush(): Promise<void>;

    public abstract isReady(): boolean;
}
