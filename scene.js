import { Color } from "./color.js";

export const SCENE = {
    lights: [{ x: -40, y: -10, z: 40 }],
    objects: [
        {
            type: "sphere",
            position: { x: -2.1, y: 3.6, z: -3 },
            radius: 2.5,
            color: new Color(128, 128, 128),
            specular: 0,
            lambert: 0.8,
            ambient: 0.3,
        },
        {
            type: "sphere",
            position: { x: 1.2, y: 2, z: -1 },
            radius: 1,
            color: new Color(100, 110, 100),
            specular: 0.999, // high spec object
            lambert: 0.7,
            ambient: 0.3,
        },
        {
            type: "sphere",
            position: { x: 1.1, y: 4.5, z: -0.5 },
            radius: 1.5,
            color: new Color(5, 5, 255),
            specular: 0.5,
            lambert: 0.8,
            ambient: 0.2,
        },
        {
            type: "sphere",
            position: { x: 3, y: 6, z: -5 },
            radius: 4,
            color: new Color(255, 255, 255),
            specular: 0.2,
            lambert: 0.7,
            ambient: 0.3,
        },
        {
            type: "sphere",
            position: { x: -0.4, y: 6, z: 0 },
            radius: 0.5,
            color: new Color(100, 110, 100),
            specular: 0.98, // high spec object
            lambert: 0.8,
            ambient: 0.3,
        },
    ],
};

