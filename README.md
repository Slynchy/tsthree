# tsthree

A 3D game framework made for TypeScript, utilizing an entity-component system on top of `three` and `pixi.js`. Designed for use in creating 3D/2D games for platforms like Facebook Instant. Bundles are built via Webpack.

Still developing both code and documentation, so it is suggested to review the existing/example code before diving into the docs.

#### Examples

* [Clicker trainer minigame](https://slynch.ovh/tsthree-examples/wireframe-clicker/)

## Dependencies

* PIXI v5.1.5
* ThreeJS v0.131.3
* ESLint v7.29.0
* TypeScript v4.3.5
* Webpack v4.41.1

## Project structure

* `./src/assets/**/*`
    * Contains all the runtime assets for the game (graphics, models, CSS, fonts, etc.)
    * Is copied into game dist so **don't put dev-only files here**
* `./src/config/**/*`
    * Should contain all game-specific configuration for the framework, also the HTML template
* `./src/game/**/*`
    * Should contain all code specific to a single game.
    * If anything can be used in other games, it should be added to `./src/engine/*`
* `./src/engine/**/*`
    * Everything the framework offers is available here. Should be as generic as possible.
* `./lib/**/*`
    * Should contain any "loose" dependencies (e.g. shaders, or code that does not have an npm module)
* `./dist/**/*`
    * After building a game, it will be output here
* `./build/**/*`
    * Should contain any scripts/configs required for Webpack or the build process in general.

## Project terminology

* `Engine` - The main funnel for all framework functionality. This is passed as a reference to most `onSomething` functions.
* `GameObject` - Essentially an `Object3D` from ThreeJS, but can have components added to it. Prefabs should extend this.
* `Component` - A relatively-small class that contains as little logic as possible.
    * Preferably only holds data, but for abstracting ThreeJS/PIXI, it's often unavoidable to require some logic to sync the component abstraction with the library implementation.
* `Scene` - A 3D/2D container for multiple GameObjects (e.g. `Level`, `WorldMap`)
* `State` - An abstraction beyond Scene to represent areas of a game (e.g. `Init`, `Game`, `MainMenu`)
    * **Note**: Adding an object to an active scene of an active state will automatically call `onStep` every frame.
* `Camera`/`MainCamera` - Basic abstraction of ThreeJS cameras. `Engine` can only have one main camera at a time. 
* "Step" - A single frame, handled by the framework abstracting `PIXI.Ticker`
* 

## Getting started

1. Clone the repository
1. Run `npm install` to install dependencies
1. Run the appropriate command:
    * `npm run dev` to start a local Webpack dev-server at port `8080`
    * `npm run build` to build without production settings (i.e. no minification)
    * `npm run build-prod` to build with production settings

## Building a game

It is suggested to clone the repository and edit the existing implementations to suit your needs. However, this section will cover how to get up-and-running with your own code.

### Entrypoint

First, your `index.ts` file should look something like this:

```
import { Engine } from "./tsthree";
import { BootAssets } from "./config/BootAssets";
import { PIXIConfig } from "./config/PIXIConfig";
import { Init } from "./game/States/Init";

function main(): void {
  const engine: Engine = new Engine(PIXIConfig);

    engine.init(
      new Init(),
      BootAssets
    ).then(() => { 
      console.log("Engine initialized without errors.");

      // Only needed if `autoStart` is false in `PIXIConfig`
      _engine.getTicker().start();
    });
}

main();
```

The `Init` state (under `src/game/States/Init.ts`) should contain/initialize everything needed for game start, before moving onto another state (likely the main menu or FTU experience). 

### New state/scene

To create a new State, create a new file under `src/game/States/` and extend the base `State` class in `src/engine/State.ts`. At minimum, a State class must possess the following abstraction implementations:

* `onDestroy()` - Called when the State is destroyed
* `onAwake()` - Called when the State is instantiated
* `onStep()` - Called when the framework is processing a frame

The `onAwake` function should handle instantiating everything needed for the State, and you can add objects to the currently-active scene in the following way:

```
    // Create a GameObject
    const go = new GameObject();

    // Add a visual component so we can see it!
    go.addComponent(new Debug3DComponent(Debug3DShapes.PLANE));

    // Add to scene
    stateInstance.getScene().addObject(go);
```

### PIXI UI Layer

The UI layer uses PIXI for ease-of-use. This can be stripped relatively easily if you wish to use ThreeJS for everything. If making use of the UI manager, you can instantiate PIXI objects as normal and add them to the UI manager like this:

```
engineInstance.getUIManager().addObject( new PIXI.Text("test", {}) );
```

The UI area of the framework is rather underdeveloped for now. Ideally there would be a `GameObject2D` class specifically for PIXI utilization

### Loading WASM

```
engineInstance.loadWASM(
    "lerp", // name of WASM module/function
    "./assets/lerp.js" // src URL
)
.then((): void => {
    // resolved when loaded

    // get function like this
    const _module: { lerp: Function } = _engine.getWASM("lerp");
    
    // call function like this
    console.log("Result of lerp from WASM: %f", _module.lerp(0, 444, 0.2));
})
.catch((err) => {
    // An error occurred, user does not support WASM most likely
    console.error(err);
});
```
