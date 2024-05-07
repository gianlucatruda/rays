// TODO needs big refactor
export class Vec3D {
    constructor(x, y, z) {
        [this.x, this.y, this.z] = [x, y, z];
    }
    static ZERO = new Vec3D(0, 0, 0);
    static UP = new Vec3D(0, 1, 0);

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static cross(a, b) {
        return new Vec3D(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    static scale(a, t) {
        return new Vec3D(a.x * t, a.y * t, a.z * t);
    }

    scale(m) {
        return new Vec3D(this.x * m, this.y * m, this.z * m);
    }

    static normalise(a) {
        const length = Math.sqrt(this.dot(a, a));
        return this.scale(a, 1 / length);
    }

    static add(a, b) {
        return new Vec3D(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static subtract(a, b) {
        return new Vec3D(a.x - b.x, a.y - b.y, a.z - b.z);
    }
}


