import { Engine } from "./tsthree";
import { BootAssets } from "./config/BootAssets";
import { PIXIConfig } from "./config/PIXIConfig";
import { Init } from "./game/States/Init";
import { ShadowLightingTest } from "./engine/States/ShadowLightingTest";

function main(): void {
  const engine: Engine = new Engine(PIXIConfig);

    engine.init(
        new ShadowLightingTest(),
        BootAssets
    ).then(() => console.log("Engine initialized without errors."));
}

main();
