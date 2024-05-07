import { Color } from "./color.js";
import { Sphere } from "./sphere.js";

export const SCENE = {
    lights: [{ x: -40, y: -10, z: 40 }],
    objects: [
        {
            shape: new Sphere([-2.1, 3.6, -3], 2.5),
            color: new Color(128, 128, 128),
            specular: 0,
            lambert: 0.8,
            ambient: 0.3,
        },
        {
            shape: new Sphere([1.2, 2, -1], 1),
            color: new Color(100, 110, 100),
            specular: 0.999, // high spec object
            lambert: 0.7,
            ambient: 0.3,
        },
        {
            shape: new Sphere([1.1, 4.5, -0.5], 1.5),
            color: new Color(5, 5, 255),
            specular: 0.5,
            lambert: 0.8,
            ambient: 0.2,
        },
        {
            shape: new Sphere([3, 6, -5], 4),
            color: new Color(255, 255, 255),
            specular: 0.2,
            lambert: 0.7,
            ambient: 0.3,
        },
        {
            shape: new Sphere([-0.4, 6, 0], 0.5),
            color: new Color(100, 110, 100),
            specular: 0.98, // high spec object
            lambert: 0.8,
            ambient: 0.3,
        },
    ],
};

