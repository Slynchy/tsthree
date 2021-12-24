import { Engine, GameObject, HelperFunctions, State } from "../../tsthree";
import { tsthreeConfig } from "../../config/tsthreeConfig";
import {
    CameraHelper,
    DirectionalLight,
    Mesh,
    MeshPhongMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    SpotLight
} from "three";
import { Debug3DComponent, Debug3DShapes } from "../Components/Debug3DComponent";
import * as Mousetrap from "mousetrap";

/*
 Checklist for if lights work here but not in your own scene:
    - `renderer.shadowMap.enabled = true`?
    - `Scene.children.forEach((e) => e.castShadows = e.receiveShadows = true)`?
    - `light.castShadow = true`
    - `directionalLight.shadow.camera.left/right/top/bottom`?
*/
export class ShadowLightingTest extends State {

    private debugCamera: PerspectiveCamera;
    private camera: PerspectiveCamera;

    private goingUp: boolean = false;
    private shadowCaster: GameObject;

    public onAwake(_engine: Engine): void {

        // First, enable shadow maps and configure
        _engine.getRenderer().shadowMap.enabled = true;
        _engine.getRenderer().shadowMap.autoUpdate = true;
        _engine.getRenderer().shadowMap.type = PCFSoftShadowMap;
        _engine.getRenderer().setSize(
            window.innerHeight * (tsthreeConfig.width / tsthreeConfig.height),
            window.innerHeight
        );

        // Reset the main camera and configure the debug one
        HelperFunctions.resetCamera(_engine.getMainCamera());
        this.camera = _engine.getMainCamera() as PerspectiveCamera;
        this.camera.position.set(0, 0, 40);
        this.debugCamera = new PerspectiveCamera(
            this.camera.fov * 2,
            this.camera.aspect,
            this.camera.near,
            this.camera.far
        );
        this.debugCamera.position.set(-0.8, 0.3, 39.3);

        // Create the object to cast shadows
        this.shadowCaster = new GameObject();
        this.shadowCaster.addComponent(new Debug3DComponent(Debug3DShapes.OCTAHEDRON));
        const shadowCasterMesh: Mesh = this.shadowCaster.getComponent(Debug3DComponent).getMesh();
        shadowCasterMesh.material = new MeshPhongMaterial({color: "red"})
        shadowCasterMesh.receiveShadow = true;
        shadowCasterMesh.castShadow = true;
        this.shadowCaster.translateZ(-18);
        this.scene.addObject(this.shadowCaster);

        // Create background to receive shadows
        const ground = new GameObject();
        ground.addComponent(new Debug3DComponent(Debug3DShapes.PLANE));
        const groundMesh = ground.getComponent(Debug3DComponent).getMesh();
        groundMesh.receiveShadow = true;
        groundMesh.castShadow = true;
        groundMesh.scale.set(50, 50, 1);
        ground.translateZ(-20);
        groundMesh.material = new MeshPhongMaterial({color: "#7acf7a"});
        this.scene.addObject(ground);

        // Create directional light
        const directionalLight: DirectionalLight = new DirectionalLight(0xfafafa, 1);
        directionalLight.position.set(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z + 20,
        );
        directionalLight.shadow.camera.position.set(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z,
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.autoUpdate = true;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        // @ts-ignore
        this.scene.addObject(directionalLight);
        this.debugCamera.translateZ(-30);
        this.debugCamera.translateX(-33);
        this.debugCamera.lookAt(this.shadowCaster.position);
        directionalLight.target.updateMatrixWorld();

        // Create spotlight
        const spotLight: SpotLight = new SpotLight("#fa1111", 1);
        spotLight.target.position.set(
            this.shadowCaster.position.x,
            this.shadowCaster.position.y,
            this.shadowCaster.position.z,
        )
        spotLight.castShadow = true;
        spotLight.shadow.autoUpdate = true;
        // @ts-ignore
        this.scene.addObject(spotLight);
        // @ts-ignore
        this.scene.addObject(new CameraHelper(spotLight.shadow.camera));
        spotLight.target.updateMatrixWorld();

        // add controls
        this.bindControls(_engine);

        _engine.getTicker().start();
    }

    public onDestroy(_engine: Engine): void {
        Mousetrap.reset();
        _engine.setMainCamera(this.camera);
        this.scene.removeAllObjects();
    }

    public onStep(_engine: Engine): void {
        this.scene.onStep(_engine);

        const speed = 0.1 * _engine.deltaTime * (this.goingUp ? -1 : 1);
        this.shadowCaster.position.y += speed;
        if (this.shadowCaster.position.y > 10) {
            this.goingUp = true;
        } else if (this.shadowCaster.position.y < -10) {
            this.goingUp = false;
        }
    }

    private bindControls(_engine: Engine): void {
        Mousetrap.bind("1", () => {
            console.log("Setting camera to debug");
            _engine.setMainCamera(this.debugCamera);
        });
        Mousetrap.bind("2", () => {
            console.log("Setting camera to normal");
            _engine.setMainCamera(this.camera);
        });

        Mousetrap.bind("q", () => {
            // @ts-ignore
            _engine.getMainCamera().fov += 0.5;
        });
        Mousetrap.bind("e", () => {
            // @ts-ignore
            _engine.getMainCamera().fov -= 0.5;
        });
    }

    preload(_engine: Engine): Promise<void> {
        return Promise.resolve(undefined);
    }
}
