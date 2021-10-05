import { Engine } from "./tsthree";
import { BootAssets } from "./config/BootAssets";
import { PIXIConfig } from "./config/PIXIConfig";
import { Init } from "./game/States/Init";

function main(): void {
  const engine: Engine = new Engine(PIXIConfig);

    engine.init(
        new Init(),
        BootAssets
    ).then(() => console.log("Engine initialized without errors."));
}

main();
