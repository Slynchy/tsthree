import { Engine } from "./tsthree";
import { BootAssets } from "./config/BootAssets";
import { tsthreeConfig } from "./config/tsthreeConfig";
import { Init } from "./game/States/Init";
import { ShadowLightingTest } from "./engine/States/ShadowLightingTest";

function main(): void {
  const engine: Engine = new Engine(tsthreeConfig);

    engine.init(
        new ShadowLightingTest(),
        BootAssets
    ).then(() => console.log("Engine initialized without errors."));
}

main();
