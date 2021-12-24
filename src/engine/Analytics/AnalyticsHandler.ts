import { BaseAnalytics } from "./BaseAnalytics";
import { ENGINE_DEBUG_MODE } from "../Constants/Constants";

export class AnalyticsHandler {

    private _analyticsReferences: BaseAnalytics[];

    constructor(_analyticsModules: BaseAnalytics[]) {
        this._analyticsReferences = [..._analyticsModules];
    }

    public logEvent(...args: unknown[]): void {
        if (ENGINE_DEBUG_MODE) {
            if (this._analyticsReferences.length > 0) console.log("Logging event: %o", args);
        }
        this._analyticsReferences.forEach((e) => e.logEvent.apply(null, arguments));
    }
}
