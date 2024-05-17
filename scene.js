import { Color } from "./color.js";
import { Sphere } from "./sphere.js";

export const SCENE = {
    lights: [
        { x: 0, y: -10, z: 30 },
    ],
    objects: [
        {
            shape: new Sphere([0, 0, 0], 1),
            color: new Color(200, 200, 200),
            specular: 0.99,
            lambert: 0.8,
            ambient: 0.1,
        },
        {
            shape: new Sphere([-2, 0, 0], 1),
            color: new Color(50, 50, 50),
            specular: 0.999, // high spec object
            lambert: 0.9,
            ambient: 0.01,
        },
        {
            shape: new Sphere([2, 0, 0], 1),
            color: new Color(128, 128, 128),
            specular: 0.01,
            lambert: 0.99,
            ambient: 0.99,
        },
        {
            shape: new Sphere([0, 0.5, 1.7], 0.5),
            color: new Color(200, 50, 50),
            specular: 0.001,
            lambert: 0.8,
            ambient: 0.8,
        },
        {
            shape: new Sphere([-1, 0.5, 1.7], 0.5),
            color: new Color(50, 200, 50),
            specular: 0.001,
            lambert: 0.8,
            ambient: 0.8,
        },
        {
            shape: new Sphere([1, 0.5, 1.7], 0.5),
            color: new Color(50, 50, 200),
            specular: 0.001,
            lambert: 0.8,
            ambient: 0.8,
        },
        {
            shape: new Sphere([0, 0.75, 2.5], 0.25),
            color: new Color(50, 50, 50),
            specular: 0.9,
            lambert: 0.8,
            ambient: 0.8,
        },
        {
            shape: new Sphere([-1, 0.75, 2.5], 0.25),
            color: new Color(50, 50, 200),
            specular: 0.001,
            lambert: 0.8,
            ambient: 0.8,
        },
        {
            shape: new Sphere([1, 0.75, 2.5], 0.25),
            color: new Color(50, 200, 50),
            specular: 0.001,
            lambert: 0.8,
            ambient: 0.8,
        },
        {
            shape: new Sphere([0, 100.99, 0], 100),
            color: new Color(100, 100, 100),
            specular: 0.1,
            lambert: 0.8,
            ambient: 0.8,
        },
    ],
};

