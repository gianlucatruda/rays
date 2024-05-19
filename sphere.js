import { Vec3D } from "./vec3d.js";

export class Sphere {
    constructor([x, y, z], r) {
        this.origin = { x: x, y: y, z: z };
        this.radius = r;
    }
    getIntersect(ray, tMin = 0.001, tMax = 1000) {
        // https://raytracing.github.io/books/RayTracingInOneWeekend.html#surfacenormalsandmultipleobjects/simplifyingtheray-sphereintersectioncode
        const oc = Vec3D.subtract(this.origin, ray.origin);
        const a = Vec3D.dot(ray.vector, ray.vector);
        const h = Vec3D.dot(ray.vector, oc);
        const c = Vec3D.dot(oc, oc) - this.radius ** 2;
        let discriminant = h ** 2 - a * c;

        if (discriminant < 0) return;
        const sqrtDisc = Math.sqrt(discriminant);
        let root = (h - sqrtDisc) / a;
        if (root <= tMin || root >= tMax) {
            root = (h + sqrtDisc) / a;
            if (root <= tMin || root >= tMax) return;
        }
        return root;

    }

}

