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
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    static scale(a, t) {
        return { x: a.x * t, y: a.y * t, z: a.z * t };
    }

    static normalise(a) {
        const length = Math.sqrt(this.dot(a, a));
        return this.scale(a, 1 / length);
    }

    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    static subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }
}


