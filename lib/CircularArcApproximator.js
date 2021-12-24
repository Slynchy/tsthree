var Vector;
Vector = (function () {
    function Vector(x, y, z) {
        this.x = x != null ? x : 0;
        this.y = y != null ? y : 0;
        this.z = z != null ? z : 0;
    }

    Vector.prototype.add = function (vector) {
        let x = this.x + vector.x;
        let y = this.y + vector.y;
        let z = this.z + vector.z;
        return new Vector(x, y, z);
    };

    Vector.add = function (v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    };

    Vector.prototype.sub = function (vector) {
        let x = this.x - vector.x;
        let y = this.y - vector.y;
        let z = this.z - vector.z;
        return new Vector(x, y, z);
    };

    Vector.sub = function (v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    };

    Vector.prototype.mult = function (scalar) {
        let x = this.x * scalar;
        let y = this.y * scalar;
        let z = this.z * scalar;
        return new Vector(x, y, z);
    };

    Vector.mult = function (vector, scalar) {
        return new Vector(vector.x * scalar, vector.y * scalar, vector.z * scalar);
    };

    Vector.prototype.div = function (scalar) {
        let x = this.x / scalar;
        let y = this.y / scalar;
        let z = this.z / scalar;
        return new Vector(x, y, z);
    };

    Vector.div = function (vector, scalar) {
        return new Vector(vector.x / scalar, vector.y / scalar, vector.z / scalar);
    };

    Vector.prototype.magSq = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    };

    Vector.prototype.mag = function () {
        return Math.sqrt(this.magSq());
    };

    Vector.prototype.normalize = function () {
        return this.div(this.mag());
    };

    Vector.prototype.limit = function (max) {
        if (this.mag() > max) return this.normalize() && this.mult(max);
    };

    Vector.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    };

    Vector.prototype.distance = function (vector) {
        var dx, dy, dz;
        dx = this.x - vector.x;
        dy = this.y - vector.y;
        dz = this.z - vector.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    Vector.distance = function (v1, v2) {
        var dx, dy, dz;
        dx = v1.x - v2.x;
        dy = v1.y - v2.y;
        dz = v1.z - v2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y, this.z);
    };

    Vector.prototype.toString = function () {
        return '(' + [this.x, this.y, this.z].join(', ') + ')';
    };

    return Vector;
})();

/**
 * Estimates a circular arc; it's not great but kind-of fast
 * Ported from C#
 * @author https://github.com/Slynchy/OSU-JS/blob/master/src/CircularArcApproximator.js
 */
export class CircularArcApproximator {
    static CreateArc(pa, pb, pc, tolerance) {
        let a, b, c;

        //if(!(a instanceof Vector)){
        a = new Vector(pa.x, pa.y);
        b = new Vector(pb.x, pb.y);
        c = new Vector(pc.x, pc.y);
        // } else {
        // 	a = pa;
        // 	b = pb;
        // 	c = pc;
        // }

        let aSq = Math.pow(b.sub(c).distance(new Vector(0, 0)), 2); //CircularArcApproximator.LengthSquared(CircularArcApproximator.SubtractTwoVectors(b,c));
        let bSq = Math.pow(a.sub(c).distance(new Vector(0, 0)), 2); //CircularArcApproximator.LengthSquared(CircularArcApproximator.SubtractTwoVectors(a,c));
        let cSq = Math.pow(a.sub(b).distance(new Vector(0, 0)), 2); //CircularArcApproximator.LengthSquared(CircularArcApproximator.SubtractTwoVectors(a,b));

        let s = aSq * (bSq + cSq - aSq);
        let t = bSq * (aSq + cSq - bSq);
        let u = cSq * (aSq + bSq - cSq);

        let sum = s + t + u;

        // let centre = (
        // 	(a.mult(s)) +
        // 	(b.mult(t)) +
        // 	(c.mult(u))
        // ) / sum;
        let centre = a
            .mult(s)
            .add(b.mult(t))
            .add(c.mult(u))
            .div(sum);
        let dA = a.sub(centre);
        let dC = c.sub(centre);

        let r = dA.distance(new Vector(0, 0));

        let thetaStart = Math.atan2(dA.y, dA.x);
        let thetaEnd = Math.atan2(dC.y, dC.x);

        while (thetaEnd < thetaStart) thetaEnd += 2 * Math.PI;

        let dir = 1;
        let thetaRange = thetaEnd - thetaStart;

        // Decide in which direction to draw the circle, depending on which side of
        // AC B lies.
        let orthoAtoC = c.sub(a);
        orthoAtoC = new Vector(orthoAtoC.y, -orthoAtoC.x);
        if (orthoAtoC.dot(b.sub(a)) < 0) {
            dir = -dir;
            thetaRange = 2 * Math.PI - thetaRange;
        }

        // We select the amount of points for the approximation by requiring the discrete curvature
        // to be smaller than the provided tolerance. The exact angle required to meet the tolerance
        // is: 2 * Math.Acos(1 - TOLERANCE / r)
        // The special case is required for extremely short sliders where the radius is smaller than
        // the tolerance. This is a pathological rather than a realistic case.
        let amountPoints =
            2 * r <= tolerance
                ? 2
                : Math.max(2, Math.ceil(thetaRange / (2 * Math.acos(1 - tolerance / r))));

        let output = []; //new List<Vector2>(amountPoints);

        for (let i = 0; i < amountPoints; ++i) {
            let fract = i / (amountPoints - 1);
            let theta = thetaStart + dir * fract * thetaRange;
            let o = new Vector(Math.cos(theta), Math.sin(theta)).mult(r);
            output.push(centre.add(o));
        }

        return output;
    }
}
