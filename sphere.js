import { Vec3D } from "./vec3d.js";

export class Sphere {
    constructor([x, y, z], r) {
        this.origin = { x: x, y: y, z: z };
        this.radius = r;
    }
    getIntersect(ray) {
        // https://raytracing.github.io/books/RayTracingInOneWeekend.html#surfacenormalsandmultipleobjects/simplifyingtheray-sphereintersectioncode
        const oc = Vec3D.subtract(this.origin, ray.origin);
        const a = Vec3D.dot(ray.vector, ray.vector);
        const h = Vec3D.dot(ray.vector, oc);
        const c = Vec3D.dot(oc, oc) - this.radius ** 2;
        let discriminant = h ** 2 - a * c;

        if (discriminant < 0) return;
        return (h - Math.sqrt(discriminant)) / a;
    }

}

