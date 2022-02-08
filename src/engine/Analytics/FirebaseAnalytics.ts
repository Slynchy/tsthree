import { BaseAnalytics } from "./BaseAnalytics";
import { HelperFunctions } from "../HelperFunctions";
import { Analytics, logEvent as FBLogEvent } from "firebase/analytics";

export class FirebaseAnalytics extends BaseAnalytics {

    private _analyticsInstance: Analytics;

    constructor(_firebaseAnalytics: Analytics) {
        super();
        if (!_firebaseAnalytics)
            throw new Error("Firebase Analytics is required");
        this._analyticsInstance = _firebaseAnalytics;
    }

    public logEvent(eventName: string, valueToSum?: number, parameters?: { [key: string]: string; }): void {
        if (!this._analyticsInstance) {
            HelperFunctions.waitForTruth(
                () => Boolean(this._analyticsInstance),
                500
            ).then(() => {
                FBLogEvent(this._analyticsInstance, eventName, {
                    value: valueToSum,
                    ...parameters
                });
            });
            return;
        }
        return FBLogEvent(this._analyticsInstance, eventName, {
            value: valueToSum,
            ...parameters
        });
    }
}
