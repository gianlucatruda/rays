import { Color } from "./color.js";
import { SCENE } from "./scene.js";
import { Sphere } from "./sphere.js";
import { runTests } from "./tests.js";
import { userInteraction } from "./userInteraction.js";
import { Vec3D } from "./vec3d.js";

export const MOVE_MULT = 0.2;
const SHRINK_FACTOR = 6;
const MAX_REFL_DEPTH = 3;
const MAX_DIST = 40;
const CANV_WIDTH = Math.round(window.innerWidth / 1.5);
const CANV_HEIGHT = Math.floor(CANV_WIDTH / 1.78);

const canvas = document.getElementById('canvas');
[canvas.width, canvas.height] = [CANV_WIDTH, CANV_HEIGHT];
const fpsText = document.getElementById('fps-text');
const resText = document.getElementById('res-text');
const ctx = canvas.getContext('2d');
const canvasImg = ctx.getImageData(0, 0, CANV_WIDTH, CANV_HEIGHT);

export let isRealtime = false;
let prev_shrink = SHRINK_FACTOR;

export function setRealtime(b) {
    if (!b instanceof Boolean) {
        console.log("Can't use setRealtime with non Bool").
            return;
    }
    isRealtime = b;
}

export const camera = {
    position: { x: -0.2, y: 2.0, z: 10 },
    fov: 45,
    vector: { x: 0, y: 3, z: 0 },
};

class Ray {
    constructor(orig, vect) {
        this.origin = new Vec3D(orig.x, orig.y, orig.z);
        this.vector = new Vec3D(vect.x, vect.y, vect.z);
    }
}

// TODO this needs a major tidy and a rethink
function traceRay(ray, scene, depth) {
    let max_depth = MAX_REFL_DEPTH;
    if (isRealtime) max_depth = 2;
    if (depth > max_depth) return;

    const hit = firstIntersect(ray, scene);
    if (hit.dist > MAX_DIST) return new Color(200, 200, 200);
    const hitPoint = Vec3D.add(ray.origin, ray.vector.scale(hit.dist));
    const reflecNorm = Vec3D.subtract(hitPoint, hit.object.shape.origin).norm();
    // TODO generalise to nonspheres, also "sphere of concern" lol
    let object = hit.object
    const objColor = object.color;
    let newColor = new Color(0, 0, 0);
    let lambertAmount = 0;
    if (object.lambert) {
        for (const light of scene.lights) {
            let hitFromLight = firstIntersect(new Ray(
                hitPoint,
                Vec3D.subtract(hitPoint, light).norm(),
            ), scene);
            if (hitFromLight.dist < -0.005) continue; // Light source not visible
            let contribution = Vec3D.dot(
                Vec3D.subtract(light, hitPoint).norm(),
                reflecNorm);
            if (contribution > 0) {
                lambertAmount += contribution;
            }
        }
    }
    if (object.specular) {
        let reflectedVec = reflecNorm.scale(Vec3D.dot(ray.vector, reflecNorm));
        reflectedVec = Vec3D.subtract(
            reflectedVec.scale(2),
            ray.vector);
        const reflectedRay = new Ray(
            hitPoint,
            reflectedVec,
        );
        const reflectedColor = traceRay(reflectedRay, scene, ++depth);
        if (reflectedColor) {
            newColor = newColor.add(reflectedColor.scaleBy(object.specular));
        }
    }
    lambertAmount = Math.min(1, lambertAmount);
    let cFinal = new Color(
        newColor.r + (objColor.r * lambertAmount * object.lambert) + (objColor.r * object.ambient),
        newColor.g + (objColor.g * lambertAmount * object.lambert) + (objColor.g * object.ambient),
        newColor.b + (objColor.b * lambertAmount * object.lambert) + (objColor.b * object.ambient)
    );
    return cFinal;
}

function firstIntersect(ray, scene) {
    let hit = { 'dist': Infinity, 'object': null };
    for (const object of scene.objects) {
        let dist = undefined;
        if (object.shape instanceof Sphere) {
            dist = object.shape.getIntersect(ray);
        } else console.warn(`Objects of type ${object.shape} not supported yet.`);
        if (dist !== undefined && dist < hit.dist) {
            hit.dist = dist;
            hit.object = object;
        }
    }
    return hit;
}


function renderScene(scene) {
    // Don't do anything if already fully rendered
    if (prev_shrink <= 1 && !isRealtime) return;

    const tStart = performance.now();

    let shrink = Math.floor(prev_shrink - 1);
    if (isRealtime) shrink = SHRINK_FACTOR;
    prev_shrink = shrink;

    const WIDTH = Math.floor(CANV_WIDTH / shrink);
    const HEIGHT = Math.ceil(CANV_HEIGHT / shrink);

    // TODO refactor these
    const eyeVector = Vec3D.subtract(camera.vector, camera.position).norm();
    const vpRight = Vec3D.cross(eyeVector, Vec3D.UP).norm();
    const vpUp = Vec3D.cross(vpRight, eyeVector).norm();
    const fovRad = Math.PI * (camera.fov / 2) / 180;
    const halfWidth = Math.tan(fovRad);
    const halfHeight = HEIGHT / WIDTH * halfWidth;
    const pixelWidth = halfWidth * 2 / (WIDTH - 1);
    const pixelHeight = halfHeight * 2 / (HEIGHT - 1);

    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            const xComp = vpRight.scale(x * pixelWidth - halfWidth);
            const yComp = vpUp.scale(y * pixelHeight - halfHeight);
            const ray = new Ray(
                camera.position,
                Vec3D.add(Vec3D.add(eyeVector, xComp), yComp).norm()
            );
            const colorVec = traceRay(ray, scene, 0);
            for (let scY = 0; scY < shrink; scY++) {
                for (let scX = 0; scX < shrink; scX++) {
                    // Scaling from implicit screen to actual canvas size
                    const index = (shrink * x + scX) * 4 + (shrink * y + scY) * CANV_WIDTH * 4;
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
    fpsText.innerText = fps.toFixed(0) + "fps";
    resText.innerText = `${WIDTH} x ${HEIGHT}`;
    if (!isRealtime) console.log(`Rendered in ${(tDelta).toFixed(1)}ms (${fps.toFixed(0)}fps)`);
}

export function redrawFrame() {
    renderScene(SCENE);
    window.requestAnimationFrame(redrawFrame);
}

runTests();
renderScene(SCENE);
userInteraction();
redrawFrame();
