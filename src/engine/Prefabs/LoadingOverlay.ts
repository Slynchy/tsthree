import { Container, Graphics } from "pixi.js";
import { tsthreeConfig } from "../../config/tsthreeConfig";

export class LoadingOverlay extends Container {
    constructor() {
        super();

        const bg = new Graphics();
        bg.beginFill(0x060606, 0.5);
        bg.drawRect(0, 0, tsthreeConfig.width, tsthreeConfig.height);
        bg.endFill();

    }

}
