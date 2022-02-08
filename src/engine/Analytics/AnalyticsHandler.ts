import { BaseAnalytics } from "./BaseAnalytics";
import { ANALYTICS_DEBUG_MODE } from "../Constants/Constants";

export class AnalyticsHandler {

    private readonly _enabled: boolean = true;

    private _analyticsReferences: BaseAnalytics[];

    constructor(_analyticsModules: BaseAnalytics[]) {
        this._analyticsReferences = [..._analyticsModules];
    }

    public logEvent(...args: unknown[]): void {
        if (ANALYTICS_DEBUG_MODE) {
            if (this._analyticsReferences.length > 0) console.log("Logging event: %o", args);
        }
        if (!this._enabled) return;
        this._analyticsReferences.forEach((e) => e.logEvent.apply(e, args));
    }
}
