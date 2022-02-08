import { BaseAnalytics } from "./BaseAnalytics";
import { HelperFunctions } from "../HelperFunctions";

export class FacebookAnalytics extends BaseAnalytics {
    constructor() {
        super();
    }

    public logEvent(...args: unknown[]): void {
        if (!window.FBInstant) {
            HelperFunctions.waitForTruth(() => Boolean(window.FBInstant), 500).then(() => {
                FBInstant.logEvent.apply(null, args)
            });
            return;
        }
        return FBInstant.logEvent.apply(null, args);
    }
}
