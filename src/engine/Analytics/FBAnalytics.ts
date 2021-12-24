import { BaseAnalytics } from "./BaseAnalytics";
import { HelperFunctions } from "../HelperFunctions";

export class FBAnalytics extends BaseAnalytics {
    constructor() {
        super();
    }

    public logEvent(): void {
        if (!window.FBInstant) {
            HelperFunctions.waitForTruth(() => Boolean(window.FBInstant), 500).then(() => {
                FBInstant.logEvent.apply(null, arguments)
            });
            return;
        }
        return FBInstant.logEvent.apply(null, arguments);
    }
}
