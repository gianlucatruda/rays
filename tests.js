import { Vec3D } from "./vec3d.js";

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

    // Test new Vec3D.scale
    const someVec = new Vec3D(1, 2, 3);
    let scaleVec = someVec.scale(3);
    expect(scaleVec).toEqual({ x: 3, y: 6, z: 9 });

    // Test new Vec3D.norm
    const normResult = new Vec3D(3, 4, 0).norm();
    expect(normResult.x).toBeApprox(0.6);
    expect(normResult.y).toBeApprox(0.8);
    expect(normResult.z).toBeApprox(0);

    // Test Vec3D.add
    expect(Vec3D.add(new Vec3D(1, 2, 3), new Vec3D(4, 5, 6))).toEqual({ x: 5, y: 7, z: 9 });

    // Test Vec3D.plus
    expect(new Vec3D(1, 2, 3).plus(new Vec3D(4, 5, 6))).toEqual({x: 5, y: 7, z: 9});

    // Test Vec3D.subtract
    expect(Vec3D.subtract(new Vec3D(5, 7, 9), new Vec3D(4, 5, 6))).toEqual({ x: 1, y: 2, z: 3 });

    // Test Vec3D.minus
    expect(new Vec3D(5, 7, 9).minus(new Vec3D(4, 5, 6))).toEqual({ x: 1, y: 2, z: 3});

    console.log("All Vec3D tests passed!");
}

export function runTests() {
    testVec3D();
}
