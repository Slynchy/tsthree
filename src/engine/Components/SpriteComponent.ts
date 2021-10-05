import { Component } from "../Component";
import { Sprite as PIXISprite, Texture as PIXITexture, Filter as PIXIFilter } from "pixi.js";
import { TransformComponent } from "./TransformComponent";

export class SpriteComponent extends Component {

    public static readonly id: string = "SpriteComponent";
    private _sprite: PIXISprite;

    constructor(_texture?: PIXITexture) {
        super();

        if (_texture) this.setTexture(_texture);
    }

    public onAttach(): void {}

    public onDetach(): void {}
    public onComponentAttached(_componentId: string, _component: Component): void {}

    public get width(): number {
        return this._sprite.width;
    }

    public set width(_x: number) {
        this._sprite.width = _x;
    }

    public get height(): number {
        return this._sprite.height;
    }

    public set height(_y: number) {
        this._sprite.height = _y;
    }

    public addFilter(filter: PIXIFilter): void {
        if(!this._sprite.filters) this._sprite.filters = [];
        this._sprite.filters.push(filter);
    }

    public getSpriteObj(): PIXISprite | null {
        return this._sprite || null;
    }

    public setTexture(_texture: PIXITexture): void {
        if (this._sprite) {
            this._sprite.texture = _texture;
        } else {
            this.init(_texture);
        }
    }

    private init(_texture: PIXITexture): void {
        this._sprite = new PIXISprite(_texture);
    }
}
