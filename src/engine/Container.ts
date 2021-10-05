export interface Container {
    // tslint:disable-next-line:no-any
    filters: any;
    addChild: (_child: unknown) => void;
    removeChild: (_child: unknown) => void;
}
