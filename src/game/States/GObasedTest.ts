import { Engine, GameObject, State, UIManager } from "../../tsthree";
import { PIXIConfig } from "../../config/PIXIConfig";
import { Debug3DComponent, Debug3DShapes } from "../../engine/Components/Debug3DComponent";
import { Camera, MeshBasicMaterial, Object3D, Raycaster, Vector2 } from "three";
import { max_sphere_scale, min_sphere_scale, TargetSphere } from "../GameObjects/TargetSphere";
import { GAME_DEBUG_MODE } from "../../engine/Constants/Constants";
import { Container, Graphics, Sprite, Text, TextMetrics, TextStyle } from "pixi.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Background } from "../GameObjects/Background";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
// import { BadTVShader } from "../../../lib/threejs_shaders/BadTVShader";
import { lerp } from "three/src/math/MathUtils";
import InteractionEvent = PIXI.interaction.InteractionEvent;

const num_of_spheres = 25;
let sphere_timer = 150;
const max_sphere_timer = 150;
const min_sphere_spawnrate = 40;
let timeSinceLastHit: number = 0;
const speedBonusBuffer = 100;
const max_sphere_kills = 50;

export class GObasedTest extends State {

    private active = false;

    private objectPool: Object3D[] = [];
    private sphereMeshesForRaycast: Object3D[] = [];
    private sphereSpawnTimer: number = 0;

    private sphereKillCountText: Text;
    private scoreText: Text;
    private sphereKills: number = 0;
    private background: Background = null;
    // private badTVpass: ShaderPass;

    private dmgBackgroundMat: MeshBasicMaterial;
    private hitBackgroundMat: MeshBasicMaterial;

    private score: number = 0;

    private menuContainer: Container;

    private uiManagerRef: UIManager;

    private textObjs: Text[] = [];

    public onAwake(_engine: Engine): void {

        this.uiManagerRef = _engine.getUIManager();
        _engine.getMainCamera().position.set(0,0,50);
        _engine.getMainCamera().lookAt(0,0,0);

        const dmgBackground: GameObject = new GameObject();
        dmgBackground.addComponent(new Debug3DComponent(Debug3DShapes.PLANE));
        this.dmgBackgroundMat =
            dmgBackground.getComponent(Debug3DComponent).getMesh().material =
                new MeshBasicMaterial({
                    color: 0xfa3333,
                    transparent: true,
                    opacity: 0,
                });
        dmgBackground.scale.set(190, 120, 1);
        dmgBackground.position.setZ(-150);
        this.scene.addObject(dmgBackground);

        const hitBackground: GameObject = new GameObject();
        hitBackground.addComponent(new Debug3DComponent(Debug3DShapes.PLANE));
        this.hitBackgroundMat =
            hitBackground.getComponent(Debug3DComponent).getMesh().material =
                new MeshBasicMaterial({
                    color: 0x33fa33,
                    transparent: true,
                    opacity: 0,
                });
        hitBackground.scale.set(190, 120, 1);
        hitBackground.position.setZ(-150);
        this.scene.addObject(hitBackground);

        this.scene.addObject(this.background = new Background());

        // @ts-ignore
        _engine.addRenderPass(new UnrealBloomPass(new Vector2(640, 360), 1, 0.3, 0.2));

        // this.badTVpass = new ShaderPass( BadTVShader );
        // this.badTVpass.uniforms.rollSpeed.value = 0;
        // this.badTVpass.uniforms.distortion.value = 0;
        // this.badTVpass.uniforms.distortion2.value = 2;
        // this.badTVpass.renderToScreen = true;
        // _engine.addRenderPass(
        //     this.badTVpass
        // );

        this.buildUI(_engine);
        this.scoreText.visible = false;
        this.sphereKillCountText.visible = false;
        _engine.getUIManager().addObject(this.menuContainer = this.buildMenu(_engine));
        this.menuContainer.visible = true;

        for(let i = 0; i < num_of_spheres; i++) {
            const sphere = new TargetSphere();
            this.scene.addObject(sphere);
            this.objectPool.push(sphere);
            this.sphereMeshesForRaycast.push(sphere.getComponent(Debug3DComponent).getMesh());
        }

        // _engine.getInputManager().registerMouseDown( 0, (e: MouseEvent) => {
        // });

        _engine.getTicker().start();
    }

    private buildMenu(_engine: Engine): Container {
        const group = new Container();

        const title = new Text("[TITLE]", {
            fill: "red",
            align: "center",
            fontSize: 50
        });
        title.scale.set(2,2);
        title.anchor.x = 0.5;
        title.position.x = PIXIConfig.width / 2;
        title.position.y = PIXIConfig.height / 4.5;
        group.addChild(title);

        const play = new Text("Play", {
            fill: "red",
            fontSize: 50,
            interactive: true,
            buttonMode: true
        });
        play.position.x += (play.width / 2);
        play.interactive = true;
        play.buttonMode = true;
        play.on("pointerdown", () => {
            this.scoreText.visible = true;
            this.sphereKillCountText.visible = true;
            this.menuContainer.visible = false;
            this.background.rotate().then(() => this.active = true);
        });
        play.anchor.x = 0.5;

        const graph = new Graphics();
        graph.beginFill(0xfa3333);
        graph.drawRect(0,0, play.width + 5, play.height + 5);
        graph.beginFill(PIXIConfig.backgroundColor);
        graph.drawRect(1,1, play.width + 5 - 2, play.height + 5 - 2);
        graph.position.x = PIXIConfig.width / 2 - (play.width / 2);
        graph.position.y = (PIXIConfig.height / 2) + PIXIConfig.height / 4;

        group.addChild(graph);
        graph.addChild(play);

        return group;
    }

    private buildUI(_engine: Engine): void {
        this.sphereKillCountText = new Text(this.sphereKills.toString(), {
            fill: "red",
            fontFamily: "Impact",
            fontSize: 50
        } as TextStyle);
        // testText.filters = [(new BloomFilter(2))];
        this.sphereKillCountText.anchor.set(0.5, 0);
        this.sphereKillCountText.position.set(PIXIConfig.width / 2, 0);
        _engine.getUIManager().addObject(this.sphereKillCountText);
        const height = TextMetrics.measureText(
            this.sphereKillCountText.text,
            this.sphereKillCountText.style
        ).height;

        this.scoreText = new Text(this.sphereKills.toString(), {
            fill: "red",
            fontFamily: "Consolas",
            fontSize: 36
        });
        // testText.filters = [(new BloomFilter(2))];
        this.scoreText.anchor.set(0.5, 0);
        this.scoreText.position.set(
            PIXIConfig.width / 2,
            height
        );
        _engine.getUIManager().addObject(this.scoreText);

        const crt = new Sprite(_engine.getPIXITexture("crt"));
        crt.interactive = true;
        crt.width = PIXIConfig.width;
        crt.height = PIXIConfig.height;
        // does nothing because of way UI manager was implemented, smh
        // crt.blendMode = BLEND_MODES.SCREEN;
        crt.alpha = 0.3;
        _engine.getUIManager().addObject(crt);

        const raycaster = new Raycaster();
        crt.on("pointerdown", (_e: InteractionEvent) => {
            const width = parseInt(_engine.getRenderer().domElement.style.width);
            const height = parseInt(_engine.getRenderer().domElement.style.height);
            let e: PointerEvent;
            if(_e.data.originalEvent instanceof TouchEvent) {
                const factorX = width / PIXIConfig.width;
                const factorY = height / PIXIConfig.height;
                e = {
                    offsetX: _e.data.global.x * factorX,
                    offsetY: _e.data.global.y * factorY,
                } as PointerEvent
            } else {
                e = _e.data.originalEvent as PointerEvent;
            }
            if(!this.canSpawnSphere()) return;
            const mouse = new Vector2(
                ( e.offsetX / width ) * 2 - 1,
                -( e.offsetY / height ) * 2 + 1
            );
            raycaster.setFromCamera( mouse, _engine.getMainCamera() );
            // @ts-ignore
            const intersects: Array<{object: {parent: TargetSphere}}> = raycaster.intersectObjects(this.sphereMeshesForRaycast);
            if(intersects.length) {
                const res = intersects.find((e: {object: {parent: TargetSphere}}) => {
                    return e.object.parent.canExplode && e.object.parent.canExplode() === true;
                });
                if(GAME_DEBUG_MODE) {
                    console.log(res);
                    console.log(intersects);
                }
                if(res) {
                    this.onHit(
                        _engine,
                        res.object.parent as TargetSphere
                    );
                } else {
                    // to prevent instances where players can hit scores higher than 50
                    this.onMiss();
                }
            } else {
                this.onMiss();
            }
        })
    }

    private calculateScore(_obj: TargetSphere, _sphereTimer: number, _timeSinceLastHit: number): {
        bonuses: unknown,
        score: number
    } {
        let result: number = 1;

        const scaleBonus = 1 * ((max_sphere_scale - _obj.scale.x) / min_sphere_scale);
        const sphereTimerBonus = 1 * ((max_sphere_timer - _sphereTimer) / min_sphere_spawnrate);
        const speedBonus = 1 * (speedBonusBuffer / _timeSinceLastHit);

        result += scaleBonus;
        result += sphereTimerBonus;
        result += speedBonus;

        return {
            bonuses: {
                scaleBonus: scaleBonus > 0.5,
                sphereTimerBonus: sphereTimerBonus > 0.5,
                speedBonus: speedBonus > 0.4,
            },
            score: result
        };
    }

    private createText(_obj: TargetSphere, camera: Camera): Text {
        const text = new Text("TEST", {
            fill: 0xfa3333,
            fontSize: 44,
            fontFamily: "Impact",
            fontWeight: 600,
            fontStyle: "italic",
            padding: 20
        });
        text.anchor.x = 0.5;

        const vec = _obj.position.clone();
        vec.project(camera);
        text.position.x = ((vec.x + 1) * (PIXIConfig.width / 2)) - 5;
        text.position.y = (PIXIConfig.height - ((vec.y + 1) * (PIXIConfig.height / 2))) - 50;

        return text;
    }

    private onHit(_engine: Engine, _obj: TargetSphere): void {
        const scoreResult = this.calculateScore(_obj, sphere_timer, timeSinceLastHit);
        console.log(scoreResult);
        this.score += scoreResult.score;
        this.scoreText.text = (Math.round(this.score * 1000)).toLocaleString();
        timeSinceLastHit = 0;
        this.hitBackgroundMat.opacity = 0.1;

        const text = this.createText(_obj, _engine.getMainCamera());
        text.text = Math.round(scoreResult.score * 1000).toLocaleString();
        this.uiManagerRef.addObject(text);
        this.textObjs.push(text);

        this.sphereKills += 1;
        this.sphereKillCountText.text = this.sphereKills.toString();
        this.background.pulse();
        this.background.speed = 1;
        sphere_timer = Math.max(sphere_timer - 2, min_sphere_spawnrate);
        _obj.explode();
    }

    private onMiss(): void {
        this.dmgBackgroundMat.opacity = 0.4;
        sphere_timer = Math.min(sphere_timer + 1, max_sphere_timer);
        this.background.reset();
    }

    public onDestroy(_engine: Engine): void {
        this.objectPool = [];
        this.scene.removeAllObjects();
    }

    private spawnSphere(): void {
        const sphere
            = this.objectPool.find((e: TargetSphere) => (!e.active)) as TargetSphere;
        if(!sphere) {
            // console.warn("Could not spawn sphere; none left in pool");
            return;
        }
        sphere.active = true;
        sphere.reset();
    }

    private canSpawnSphere(): boolean {
        if(this.sphereKills >= max_sphere_kills) return false;

        return this.active;
    }

    public onStep(_engine: Engine): void {
        timeSinceLastHit += _engine.deltaTime;
        // this.badTVpass.uniforms.time.value += _engine.deltaTime;
        this.sphereSpawnTimer += _engine.deltaTime;
        if(this.sphereSpawnTimer >= sphere_timer) {
            this.sphereSpawnTimer = 0;
            if(this.canSpawnSphere())
                this.spawnSphere();
        }

        this.dmgBackgroundMat.opacity = lerp(this.dmgBackgroundMat.opacity, 0, 0.1 * _engine.deltaTime);
        this.hitBackgroundMat.opacity = lerp(this.hitBackgroundMat.opacity, 0, 0.1 * _engine.deltaTime);

        for(let i = this.textObjs.length - 1; i >= 0; i--) {
            const e = this.textObjs[i];
            e.position.y -= 1 * _engine.deltaTime;
            e.alpha -= 0.01 * _engine.deltaTime;
            if(e.alpha < 0) {
                this.textObjs.splice(i, 1);
                e.destroy();
            }
        }

        // @ts-ignore
        this.scene.onStep(_engine);
    }
}
