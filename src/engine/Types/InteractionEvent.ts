export interface InteractionEvent<T> {
    add: (func: T) => string;
    remove: (func: T | string) => void;
}
