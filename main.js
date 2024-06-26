import { Color } from "./color.js";
import { SCENE } from "./scene.js";
import { Sphere } from "./sphere.js";
import { runTests } from "./tests.js";
import { userInteraction } from "./userInteraction.js";
import { Vec3D } from "./vec3d.js";

export const MOVE_MULT = 0.2;
const SHRINK_FACTOR = 6;
const MAX_REFL_DEPTH = 4;
const MAX_DIST = 300;
const CANV_WIDTH = Math.round(window.innerWidth / 1.5);
const CANV_HEIGHT = Math.floor(CANV_WIDTH / 1.78);
const SKY = new Color(128 + 40, 178 + 40, 255);

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
    position: { x: 5.5, y: -1, z: 3.5 },
    fov: 50,
    vector: { x: -2.2, y: 1.0, z: 0 },
};

class Ray {
    constructor(orig, vect) {
        this.origin = new Vec3D(orig.x, orig.y, orig.z);
        this.vector = new Vec3D(vect.x, vect.y, vect.z);
    }
}

function traceRay(ray, scene, depth) {
    let max_depth = MAX_REFL_DEPTH;
    if (isRealtime) max_depth = 0;
    if (depth > max_depth) return;

    const hit = firstIntersect(ray, scene);

    if (hit.dist > MAX_DIST) return SKY;
    const hitPoint = Vec3D.add(ray.origin, ray.vector.scale(hit.dist));
    const reflecNorm = Vec3D.subtract(hitPoint, hit.object.shape.origin).norm();
    let object = hit.object
    const objColor = object.color;
    let newColor = new Color(0, 0, 0);
    let lambertAmount = 0;
    if (object.lambert) {
        for (const light of scene.lights) {
            let hitFromLight = firstIntersect(new Ray(
                hitPoint,
                Vec3D.subtract(light, hitPoint).norm(),
            ), scene);
            if (hitFromLight.dist < 1) continue; // Light source not visible
            let contribution = Vec3D.dot(
                Vec3D.subtract(light, hitPoint).norm(),
                reflecNorm
            );
            if (contribution > 0) {
                lambertAmount += contribution;
            }
        }
    }
    lambertAmount = Math.min(1, lambertAmount);
    if (object.specular) {
        // https://raytracing.github.io/books/RayTracingInOneWeekend.html#metal/mirroredlightreflection
        // `reflect = v - 2*dot(v,n)*n`
        let reflectedVec = Vec3D.subtract(
            ray.vector,
            reflecNorm.scale(2 * Vec3D.dot(ray.vector, reflecNorm)),
        );
        const reflectedRay = new Ray(
            hitPoint,
            reflectedVec,
        );
        const reflectedColor = traceRay(reflectedRay, scene, depth + 1);
        if (reflectedColor) {
            newColor = Color.add(newColor, reflectedColor.scaleBy(object.specular));
        }
    }
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
