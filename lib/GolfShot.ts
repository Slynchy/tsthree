/**
 * Typescript version of golf-shot-simulation by jcole
 * https://github.com/jcole/golf-shot-simulation
 */

import {Vector3} from "three";

function toMPS(mph: number): number {
    return mph * 0.44704;
}

function toMPH(mps: number): number {
    return mps * 2.23694;
}

function toMeters(yards: number): number {
    return yards * 0.9144;
}

function toYards(meters: number): number {
    return meters * 1.09361;
}

function toRPM(rps: number): number {
    return rps * 9.54929659;
}

class ShotPoint {
    public position: Vector3;
    public velocity: Vector3;
    public angularVelocity: Vector3;
    public acceleration: Vector3;

    constructor() {
        this.position = new Vector3(0,0,0);
        this.velocity = new Vector3(0,0,0);
        this.angularVelocity = new Vector3(0,0,0);
        this.acceleration = new Vector3(0,0,0);
    }

    public clone(): ShotPoint {
        var point = new ShotPoint();
        point.position = this.position.clone();
        point.velocity = this.velocity.clone();
        point.acceleration = this.acceleration.clone();
        point.angularVelocity = this.angularVelocity.clone();
        return point;
    }
}

export interface IGolfShotParams {
    mass?: number,
    crossSectionalArea?: number,
    smashFactor?: number,
    gravityMagnitude?: number,
    airDensity?: number,
    dragCoefficient?: number,
    liftCoefficient?: number,
    spinDecayRateConstant?: number,
    initSpeedMPH?: number,
    initVerticalAngleDegrees?: number,
    initHorizontalAngleDegrees?: number,
    initBackspinRPM?: number,
    initSpinAngle?: number,
    getDT?: () => number,
}

export class GolfShot {

    // golf ball properties
    private readonly mass: number                   // kg; from 1.62 ounces;
        = 0.0459;
    private readonly smashFactor: number            // clubhead-to-ball-initial speed ratio
        = 1.49;
    private readonly crossSectionalArea: number     // m^2
        = 0.04267 * Math.PI / 4;

    // nature
    private readonly gravityMagnitude: number       // 9.8 m/s^2
        = -9.8;
    private readonly airDensity: number             // kg/m^3
        = 1.2041;

    // golf ball aerodynamics properties
    private readonly dragCoefficient: number
        = 0.4;
    private readonly liftCoefficient: number        // made this up?
        = 0.00001;
    private readonly spinDecayRateConstant: number  // made this up?
        = 23;

    // initial shot attributes
    private readonly initSpeedMPH: number
        = 100.0; // 50 to 150
    private readonly initVerticalAngleDegrees: number
        = 22.0; // 0 to 90
    private readonly initHorizontalAngleDegrees: number
        = 9.0; // -45 to 45
    private readonly initBackspinRPM: number
        = 6000.0; // 6000
    private readonly initSpinAngle: number
        = 45.0; // -45 to 45

    // simulation properties
    private readonly getDT: () => number            // seconds
        = () => 0.1;

    public points: ShotPoint[] = [];

    constructor(options: IGolfShotParams = {} as IGolfShotParams) {
        var initPoint = new ShotPoint();

        this.mass = Boolean(options.mass) ? options.mass : this.mass;
        this.crossSectionalArea = Boolean(options.crossSectionalArea) ? options.crossSectionalArea : this.crossSectionalArea;
        this.smashFactor = Boolean(options.smashFactor) ? options.smashFactor : this.smashFactor;

        this.gravityMagnitude = Boolean(options.gravityMagnitude) ? options.gravityMagnitude : this.gravityMagnitude;
        this.airDensity = Boolean(options.airDensity) ? options.airDensity : this.airDensity;

        this.dragCoefficient = Boolean(options.dragCoefficient) ? options.dragCoefficient : this.dragCoefficient;
        this.liftCoefficient = Boolean(options.liftCoefficient) ? options.liftCoefficient : this.liftCoefficient;
        this.spinDecayRateConstant = Boolean(options.spinDecayRateConstant) ? options.spinDecayRateConstant : this.spinDecayRateConstant; // made this up?

        this.initSpeedMPH = Boolean(options.initSpeedMPH) ? options.initSpeedMPH : this.initSpeedMPH;
        this.initVerticalAngleDegrees = Boolean(options.initVerticalAngleDegrees) ? options.initVerticalAngleDegrees : this.initVerticalAngleDegrees;
        this.initHorizontalAngleDegrees = Boolean(options.initHorizontalAngleDegrees) ? options.initHorizontalAngleDegrees : this.initHorizontalAngleDegrees;
        this.initBackspinRPM = Boolean(options.initBackspinRPM) ? options.initBackspinRPM : this.initBackspinRPM;
        this.initSpinAngle = Boolean(options.initSpinAngle) ? options.initSpinAngle : this.initSpinAngle;

        this.getDT = options.getDT || this.getDT;

        // initial velocity
        initPoint.velocity = this.getInitialVelocity(
            this.initSpeedMPH,
            this.smashFactor,
            this.initVerticalAngleDegrees,
            this.initHorizontalAngleDegrees
        );

        // initial angular velocity (spin rate)
        initPoint.angularVelocity = this.getInitialSpin(
            this.initBackspinRPM,
            this.initSpinAngle
        );

        this.projectShot(initPoint);
    }

    private projectShot(initPoint: ShotPoint): void {
        // initial point
        var lastPoint = initPoint.clone();
        this.points.push(lastPoint);

        while(true) {
            var newPoint = lastPoint.clone();

            // calculate velcoity change
            var accel = this.getAcceleration(lastPoint);
            newPoint.velocity.add(accel.clone().multiplyScalar(this.getDT()));
            newPoint.position.add(newPoint.velocity.clone().multiplyScalar(this.getDT()));

            // calculate spin rate decay
            var decayRate = this.angularDecayVector(newPoint);
            newPoint.angularVelocity.add(decayRate);

            this.points.push(newPoint);

            if (newPoint.position.y <= 0) {
                break;
            }

            lastPoint = newPoint;
        }
    }

    private angularDecayVector(currentPoint: ShotPoint): Vector3 {
        var decay = currentPoint.angularVelocity.clone();
        decay.normalize().negate().multiplyScalar(this.spinDecayRateConstant * this.getDT());
        return decay;
    }

    private getAcceleration(currentPoint: ShotPoint): Vector3 {
        // gravity: -9.8 m/s^2
        var gravityAcceleration = new Vector3(0, this.gravityMagnitude, 0);

        // drag acceleration = drag force / mass
        var adjustedDragCoefficient = this.dragCoefficient * Math.min(1.0, 14 / currentPoint.velocity.length());
        var dragForceAcceleration = currentPoint.velocity.clone().multiplyScalar(-1 * adjustedDragCoefficient * this.airDensity * this.crossSectionalArea / this.mass);

        // magnus acceleration (from ball spin) = magnus force / mass
        var magnusForceAcceleration = currentPoint.angularVelocity.clone().cross(currentPoint.velocity).multiplyScalar(this.liftCoefficient / this.mass);

        // combined acceleration = gravity + drag + magnus
        var totalAccel = (new Vector3(0,0,0)).add(gravityAcceleration).add(dragForceAcceleration).add(magnusForceAcceleration);

        return totalAccel;
    }

    private getInitialSpin(spinRPM: number, spinAngle: number): Vector3 {
        var spin = new Vector3(0, 0, 0);
        spin.x = -1; // full backspin
        spin.y = Math.sin(spinAngle * Math.PI / 180);
        spin.normalize().multiplyScalar(spinRPM * 2 * Math.PI /60);
        return spin;
    }

    private getInitialVelocity(
        speedMPH: number,
        smashFactor: number,
        verticalDegrees: number,
        horizontalDegrees: number
    ) {
        var velocity = new Vector3(0, 0, 0);
        velocity.x = Math.sin(-1 * horizontalDegrees * Math.PI / 180);
        velocity.y = Math.sin(verticalDegrees * Math.PI / 180);
        velocity.z = Math.cos(verticalDegrees * Math.PI / 180);
        var ballSpeed = toMPS(speedMPH * smashFactor);
        return velocity.normalize().multiplyScalar(ballSpeed);
    }
}
