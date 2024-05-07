const MOVE_MULT = 0.2;
const SHRINK_FACTOR = 6;
const REFLECTION_DEPTH = 2;
const MAX_DIST = 30;
const CANV_WIDTH = Math.round(window.innerWidth / 1.5);
const CANV_HEIGHT = Math.floor(CANV_WIDTH / 1.78);
const WIDTH = Math.floor(CANV_WIDTH / SHRINK_FACTOR);
const HEIGHT = Math.ceil(CANV_HEIGHT / SHRINK_FACTOR);

const canvas = document.getElementById('canvas');
const fpsText = document.getElementById('fps-text');
const ctx = canvas.getContext('2d');

[canvas.width, canvas.height] = [CANV_WIDTH, CANV_HEIGHT];
const canvasImg = ctx.getImageData(0, 0, CANV_WIDTH, CANV_HEIGHT);

let isRealtime = false;
let trackingMouse = false;
let [startX, startY] = [0.0, 0.0];
let camera = {
    position: { x: -0.2, y: 2.0, z: 10 },
    fov: 45,
    vector: { x: 0, y: 3, z: 0 },
};

// TODO refactor interactivity to its own unit
document.onmousemove = function(e) {
    const [mouseX, mouseY] = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
    if (trackingMouse) {
        camera.vector.x += (startX - mouseX) * 1.0;
        camera.vector.y += (startY - mouseY) * 1.0;
        document.body.style.cursor = "grabbing";
    }
};
document.addEventListener('mousedown', function(e) {
    if (!isRealtime) redrawFrame();
    [startX, startY] = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
    trackingMouse = true;

});
document.addEventListener('mouseup', function() {
    trackingMouse = false;
    document.body.style.cursor = "unset";
});
document.addEventListener('keydown', function(e) {
    switch (e.key) {
        case 'w':
            camera.position.z += -1 * MOVE_MULT;
            break;
        case 's':
            camera.position.z += 1 * MOVE_MULT;
            break;
        case 'a':
            camera.position.x += -1 * MOVE_MULT;
            break;
        case 'd':
            camera.position.x += 1 * MOVE_MULT;
            break;
    }
});

class Color {
    constructor(r, g, b) {
        [this.r, this.g, this.b] = [r, g, b];
    }

    add(c) {
        this.r += c.r; this.g += c.g; this.b += c.b;
        return this;
    }

    scaleBy(x) {
        this.r *= x; this.g *= x; this.b *= x;
        return this;
    }
}

const SCENE = {
    lights: [{ x: -30, y: -10, z: 20 }],
    objects: [
        {
            type: "sphere",
            position: { x: -2.1, y: 3.6, z: -3 },
            radius: 2.5,
            color: new Color(128, 128, 128),
            specular: 0.0,
            lambert: 0.9,
            ambient: 0.3,
        },
        {
            type: "sphere",
            position: { x: 1.2, y: 2, z: -1 },
            radius: 1.0,
            color: new Color(100, 120, 100),
            specular: 0.99, // high spec object
            lambert: 0.9,
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
    ],
};

// TODO needs big refactor
class Vec3D {
    constructor(x, y, z) {
        [this.x, this.y, this.z] = [x, y, z];
    }
    static ZERO = new Vec3D(0, 0, 0);
    static UP = new Vec3D(0, 1, 0);

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static cross(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    static scale(a, t) {
        return { x: a.x * t, y: a.y * t, z: a.z * t };
    }

    static normalise(a) {
        const length = Math.sqrt(this.dot(a, a));
        return this.scale(a, 1 / length);
    }

    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    static subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }
}


// TODO this needs a tidy and a rethink
function traceRay(ray, scene, depth) {
    if (depth > REFLECTION_DEPTH) return;
    const hit = getFirstCollision(ray, scene);
    if (hit.dist > MAX_DIST) return new Color(255, 255, 255);
    const hitPoint = Vec3D.add(ray.position, Vec3D.scale(ray.vector, hit.dist));
    // TODO generalise to nonspheres, also "sphere of concern" lol
    const reflecNorm = Vec3D.normalise(Vec3D.subtract(hitPoint, hit.object.position));
    return computeReflectedColor(ray, scene, hit.object, hitPoint, reflecNorm, depth);
}

function getFirstCollision(ray, scene) {
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
    const discriminant = Math.pow(sphere.radius, 2) - eoDot + v * v;
    if (discriminant < 0) return;
    return v - Math.sqrt(discriminant);
}

// TODO needs major refactor. a total mess
function computeReflectedColor(ray, scene, object, hitPoint, normal, depth) {
    const b = object.color;
    let c = new Color(0, 0, 0);
    let lambertAmount = 0;
    if (object.lambert) {
        for (const light of scene.lights) {
            if (!isLightVisible(hitPoint, scene, light)) continue;
            let contribution = Vec3D.dot(
                Vec3D.normalise(Vec3D.subtract(light, hitPoint)),
                normal);
            if (contribution > 0) {
                lambertAmount += contribution;
            }
        }
    }

    if (object.specular) {
        let reflectedVec = Vec3D.scale(normal, Vec3D.dot(ray.vector, normal));
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
    cFinal = new Color(
        c.r + (b.r * lambertAmount * object.lambert) + (b.r * object.ambient),
        c.g + (b.g * lambertAmount * object.lambert) + (b.g * object.ambient),
        c.b + (b.b * lambertAmount * object.lambert) + (b.b * object.ambient)
    );
    return cFinal;
}

// TODO refactor
function isLightVisible(pt, scene, light) {
    let hitFromLight = getFirstCollision(
        {
            position: pt,
            vector: Vec3D.normalise(Vec3D.subtract(pt, light)),
        },
        scene
    );
    return hitFromLight.dist > -0.005;
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

function redrawFrame() {
    isRealtime = true;
    renderScene(SCENE);
    requestAnimationFrame(redrawFrame);
}

renderScene(SCENE);

function expect(value) {
    return {
        toBe: function(expected) {
            if (value !== expected) {
                throw new Error(`Expected ${expected} but got ${value}`);
            }
        },
        toBeApprox: function(expected, epsilon = 0.00001) {
            if (Math.abs(value - expected) > epsilon) {
                throw new Error(`Expected ${expected} but got ${value}`);
            }
        },
        toEqual: function(expected) {
            if (JSON.stringify(value) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(value)}`);
            }
        }
    };
}

function testVec3D() {
    console.log("Starting Vec3D tests...");

    // Test Vec3D.dot
    expect(Vec3D.dot(new Vec3D(1, 2, 3), new Vec3D(4, 5, 6))).toBe(32);

    // Test Vec3D.cross
    const crossResult = Vec3D.cross(new Vec3D(1, 2, 3), new Vec3D(4, 5, 6));
    expect(crossResult).toEqual({ x: -3, y: 6, z: -3 });

    // Test Vec3D.scale
    const scaleResult = Vec3D.scale(new Vec3D(1, 2, 3), 2);
    expect(scaleResult).toEqual({ x: 2, y: 4, z: 6 });

    // Test Vec3D.normalise
    const normaliseResult = Vec3D.normalise(new Vec3D(3, 4, 0));
    expect(normaliseResult.x).toBeApprox(0.6);
    expect(normaliseResult.y).toBeApprox(0.8);
    expect(normaliseResult.z).toBeApprox(0);

    // Test Vec3D.add
    expect(Vec3D.add(new Vec3D(1, 2, 3), new Vec3D(4, 5, 6))).toEqual({ x: 5, y: 7, z: 9 });

    // Test Vec3D.subtract
    expect(Vec3D.subtract(new Vec3D(5, 7, 9), new Vec3D(4, 5, 6))).toEqual({ x: 1, y: 2, z: 3 });

    console.log("All Vec3D tests passed!");
}

testVec3D();
