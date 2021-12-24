export abstract class BaseAnalytics {
    protected constructor() {
    }

    public abstract logEvent(): void;
}
