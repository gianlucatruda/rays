import { MOVE_MULT, camera, isRealtime, redrawFrame } from "./rays.js";

export function userInteraction() {
    let trackingMouse = false;
    let [startX, startY] = [0.0, 0.0];
    document.onmousemove = function(e) {
        const [mouseX, mouseY] = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
        if (trackingMouse) {
            camera.vector.x += (startX - mouseX) * 1;
            camera.vector.y += (startY - mouseY) * 1;
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
}

