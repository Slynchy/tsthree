export abstract class BaseAnalytics {
    protected constructor() {
    }

    public abstract logEvent(eventName: string, valueToSum?: number, parameters?: { [key: string]: string; }): void;
}
