import { MOVE_MULT, camera, setRealtime } from "./main.js";

export function userInteraction() {
    let trackingMouse = false;
    let [startX, startY] = [0.0, 0.0];
    document.onmousemove = function(e) {
        const [mouseX, mouseY] = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
        if (trackingMouse) {
            camera.vector.x += (startX - mouseX) * 1;
            camera.vector.y += (startY - mouseY) * 1;
            setRealtime(true);
            document.body.style.cursor = "grabbing";
        }
    };
    document.addEventListener('mousedown', function(e) {
        [startX, startY] = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
        trackingMouse = true;
    });
    document.addEventListener('mouseup', function() {
        trackingMouse = false;
        document.body.style.cursor = "unset";
        setRealtime(false);
    });
    document.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'w':
                camera.position.z += -1 * MOVE_MULT;
                setRealtime(true);
                break;
            case 's':
                camera.position.z += 1 * MOVE_MULT;
                setRealtime(true);
                break;
            case 'a':
                camera.position.x += -1 * MOVE_MULT;
                setRealtime(true);
                break;
            case 'd':
                camera.position.x += 1 * MOVE_MULT;
                setRealtime(true);
                break;
        }
    });
    document.addEventListener('keyup', function(e) {
        setRealtime(false);
    });
}

