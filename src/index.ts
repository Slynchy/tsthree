import { Engine } from "./tsthree";
import { BootAssets } from "./config/BootAssets";
import { tsthreeConfig } from "./config/tsthreeConfig";
import { Init } from "./game/States/Init";
import { ShadowLightingTest } from "./engine/States/ShadowLightingTest";
import { GolfTest } from "./game/States/GolfTest";

function main(): void {
  const engine: Engine = new Engine(tsthreeConfig);

    engine.init(
        // new GolfTest(),
        new ShadowLightingTest(),
        BootAssets
    ).then(() => console.log("Engine initialized without errors."));
}

main();
