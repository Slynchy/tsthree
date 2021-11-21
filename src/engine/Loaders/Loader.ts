export abstract class Loader<T> {
  public abstract add(_key: string, _asset: string): void;
  public abstract get<T>(_key: string): T;
  public abstract load(): Promise<void>;

  public abstract unload(_key: string): void;

  public abstract cache<T>(_key: string, _asset: T): void;
}
