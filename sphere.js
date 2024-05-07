import { Vec3D } from "./vec3d.js";

export class Sphere {
    constructor([x, y, z], r) {
        this.position = { x: x, y: y, z: z };
        this.radius = r;
    }
    getIntersect(ray) {
        const eyeToCenter = Vec3D.subtract(this.position, ray.position);
        const v = Vec3D.dot(eyeToCenter, ray.vector);
        const eoDot = Vec3D.dot(eyeToCenter, eyeToCenter);
        const discriminant = this.radius ** 2 - eoDot + v ** 2;
        if (discriminant < 0) return; // smelly
        return v - Math.sqrt(discriminant);
    }

}

