import { State, Engine, GameObject } from "../../tsthree";
import { PIXIConfig } from "../../config/PIXIConfig";
import { Debug3DComponent, Debug3DShapes } from "../../engine/Components/Debug3DComponent";

export class Init extends State {

    private direction: number = -1;
    private go: GameObject;

    public onAwake(_engine: Engine): void {

        console.log(_engine.getMainCamera());
        _engine.getMainCamera().position.set(0,0,5);
        _engine.getMainCamera().lookAt(0,0,0);
        _engine.getRenderer().setSize(PIXIConfig.width, PIXIConfig.height);

        this.go = new GameObject();
        this.go.addComponent(new Debug3DComponent(Debug3DShapes.PLANE));
        this.scene.addObject(this.go);

        _engine.getTicker().start();
    }

    public onDestroy(_engine: Engine): void {
        this.scene.removeAllObjects();
    }

    public onStep(_engine: Engine): void {
        this.scene.onStep(_engine);
        this.go.position.x += this.direction * _engine.deltaTime;
        if(this.go.position.x < -75) {
            this.direction = 1;
        } else if(this.go.position.x > 75) {
            this.direction = -1;
        }
    }
}
