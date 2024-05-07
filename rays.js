import { Color } from "./color.js";
import { SCENE } from "./scene.js";
import { runTests } from "./tests.js";
import { userInteraction } from "./userInteraction.js";
import { Vec3D } from "./vec3d.js";

export const MOVE_MULT = 0.2;
const SHRINK_FACTOR = 8;
const REFLECTION_DEPTH = 2;
const MAX_DIST = 20;
const CANV_WIDTH = Math.round(window.innerWidth / 1.5);
const CANV_HEIGHT = Math.floor(CANV_WIDTH / 1.78);
const WIDTH = Math.floor(CANV_WIDTH / SHRINK_FACTOR);
const HEIGHT = Math.ceil(CANV_HEIGHT / SHRINK_FACTOR);

const canvas = document.getElementById('canvas');
const fpsText = document.getElementById('fps-text');
const ctx = canvas.getContext('2d');

[canvas.width, canvas.height] = [CANV_WIDTH, CANV_HEIGHT];
const canvasImg = ctx.getImageData(0, 0, CANV_WIDTH, CANV_HEIGHT);

export let isRealtime = false;
export const camera = {
    position: { x: -0.2, y: 2.0, z: 10 },
    fov: 45,
    vector: { x: 0, y: 3, z: 0 },
};

// TODO this needs a tidy and a rethink
function traceRay(ray, scene, depth) {
    if (depth > REFLECTION_DEPTH) return;
    const hit = firstIntersect(ray, scene);
    if (hit.dist > MAX_DIST) return new Color(255, 255, 255);
    const hitPoint = Vec3D.add(ray.position, Vec3D.scale(ray.vector, hit.dist));
    // TODO generalise to nonspheres, also "sphere of concern" lol
    const reflecNorm = Vec3D.normalise(Vec3D.subtract(hitPoint, hit.object.position));
    let object = hit.object
    const b = object.color;
    let c = new Color(0, 0, 0);
    let lambertAmount = 0;
    if (object.lambert) {
        for (const light of scene.lights) {
            let hitFromLight = firstIntersect({
                position: hitPoint,
                vector: Vec3D.normalise(Vec3D.subtract(hitPoint, light)),
            }, scene);
            if (hitFromLight.dist < -0.005) continue; // Light source not visible
            let contribution = Vec3D.dot(
                Vec3D.normalise(Vec3D.subtract(light, hitPoint)),
                reflecNorm);
            if (contribution > 0) {
                lambertAmount += contribution;
            }
        }
    }
    if (object.specular) {
        let reflectedVec = Vec3D.scale(reflecNorm, Vec3D.dot(ray.vector, reflecNorm));
        reflectedVec = Vec3D.subtract(Vec3D.scale(reflectedVec, 2), ray.vector);
        const reflectedRay = {
            position: hitPoint,
            vector: reflectedVec,
        };
        const reflectedColor = traceRay(reflectedRay, scene, ++depth);
        if (reflectedColor) {
            c = c.add(reflectedColor.scaleBy(object.specular));
        }
    }
    lambertAmount = Math.min(1, lambertAmount);
    let cFinal = new Color(
        c.r + (b.r * lambertAmount * object.lambert) + (b.r * object.ambient),
        c.g + (b.g * lambertAmount * object.lambert) + (b.g * object.ambient),
        c.b + (b.b * lambertAmount * object.lambert) + (b.b * object.ambient)
    );
    return cFinal;
}

function firstIntersect(ray, scene) {
    let hit = { 'dist': Infinity, 'object': null };
    for (const object of scene.objects) {
        if (object.type != "sphere") console.warn(`Could not render unsuported '${object.type}' object.`);
        let dist = null;
        if (object.type == "sphere") dist = getSphereHit(object, ray);
        if (dist !== undefined && dist < hit.dist) {
            hit.dist = dist;
            hit.object = object;
        }
    }
    return hit;
}

// TODO refactor 
// TODO just have a sphere class?
function getSphereHit(sphere, ray) {
    const eyeToCenter = Vec3D.subtract(sphere.position, ray.position);
    const v = Vec3D.dot(eyeToCenter, ray.vector);
    const eoDot = Vec3D.dot(eyeToCenter, eyeToCenter);
    const discriminant = sphere.radius ** 2 - eoDot + v ** 2;
    if (discriminant < 0) return;
    return v - Math.sqrt(discriminant);
}


function renderScene(scene) {
    const tStart = performance.now();

    // TODO refactor these
    const eyeVector = Vec3D.normalise(Vec3D.subtract(camera.vector, camera.position));
    const vpRight = Vec3D.normalise(Vec3D.cross(eyeVector, Vec3D.UP));
    const vpUp = Vec3D.normalise(Vec3D.cross(vpRight, eyeVector));
    const fovRad = Math.PI * (camera.fov / 2) / 180;
    const halfWidth = Math.tan(fovRad);
    const halfHeight = HEIGHT / WIDTH * halfWidth;
    const pixelWidth = halfWidth * 2 / (WIDTH - 1);
    const pixelHeight = halfHeight * 2 / (HEIGHT - 1);

    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            const xComp = Vec3D.scale(vpRight, x * pixelWidth - halfWidth);
            const yComp = Vec3D.scale(vpUp, y * pixelHeight - halfHeight);
            const ray = {
                position: camera.position,
                vector: Vec3D.normalise(Vec3D.add(Vec3D.add(eyeVector, xComp), yComp))
            };

            const colorVec = traceRay(ray, scene, 0);
            for (let scY = 0; scY < SHRINK_FACTOR; scY++) {
                for (let scX = 0; scX < SHRINK_FACTOR; scX++) {
                    // Scaling from implicit screen to actual canvas size
                    const index = (SHRINK_FACTOR * x + scX) * 4 + (SHRINK_FACTOR * y + scY) * CANV_WIDTH * 4;
                    canvasImg.data[index + 0] = colorVec.r;
                    canvasImg.data[index + 1] = colorVec.g;
                    canvasImg.data[index + 2] = colorVec.b;
                    canvasImg.data[index + 3] = 255;
                }
            }
        }
    }
    ctx.putImageData(canvasImg, 0, 0);

    let tDelta = performance.now() - tStart;
    let fps = 1 / (tDelta / 1000);
    if (isRealtime) fpsText.innerText = fps.toFixed(0) + "fps";
    console.log(`Rendered in ${(tDelta).toFixed(1)}ms (${fps.toFixed(0)}fps)`);
}

export function redrawFrame() {
    isRealtime = true;
    renderScene(SCENE);
    requestAnimationFrame(redrawFrame);
}

renderScene(SCENE);
runTests();
userInteraction();
