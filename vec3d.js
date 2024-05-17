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

    scale(m) {
        return new Vec3D(this.x * m, this.y * m, this.z * m);
    }

    norm() {
        let length = Math.sqrt(Vec3D.dot(this, this));
        return this.scale(1 / length);

    }

    static add(a, b) {
        return new Vec3D(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    plus(b) {
        return new Vec3D(this.x + b.x, this.y + b.y, this.z + b.z);
    }

    static subtract(a, b) {
        return new Vec3D(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    minus(b) {
        return new Vec3D(this.x - b.x, this.y - b.y, this.z - b.z);
    }
}


