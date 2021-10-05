export abstract class Loader {
  public abstract add(_key: string, _asset: string): void;
  public abstract get<T>(_key: string): T;
  public abstract load(): Promise<void>;
}
