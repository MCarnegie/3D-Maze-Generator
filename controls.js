import * as t from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let overheadview = false
let characterController;
let player

let pointerLockControls;
let orbitControls;

const overlay = document.getElementById("overlay")

export function createp(px, py, pz, physics, scene, ph, pw) {
    const geometry = new t.CapsuleGeometry(pw, ph, 8, 8);
    const material = new t.MeshStandardMaterial({ color: 0xFFFF00 });
    player = new t.Mesh(geometry, material);
    player.position.set(px, py, pz);

    scene.add(player)

    characterController = physics.world.createCharacterController(0.01);
    characterController.setApplyImpulsesToDynamicBodies(true);
    characterController.setCharacterMass(pw);
    const colliderDesc = physics.RAPIER.ColliderDesc.capsule(ph, pw).setTranslation(px, ph, pz);
    player.userData.collider = physics.world.createCollider(colliderDesc);


}

export function getOveheadview() {
    console.log(overheadview)
}

//for orbital camera so it centers on any size maze!!!
function centerOrbital(camera, mazeWidth, wallWidth, mazeHeight) {
    camera.position.x = mazeWidth / 2 * wallWidth
    camera.position.y = 100
    camera.position.z = mazeHeight / 2 * wallWidth
    orbitControls.target.set(mazeWidth / 2 * wallWidth, 0, mazeHeight / 2 * wallWidth);
    camera.lookAt(mazeWidth / 2 * wallWidth, 0, mazeHeight / 2 * wallWidth)
}

export function controlDetection() {
    const onKeyDown = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'KeyQ':
                overheadview = true;
                break;

        }

    };

    const onKeyUp = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

            case 'KeyQ':
                overheadview = false;
                pointerLockControls.enabled = true;
                orbitControls.enabled = false;
                break;

        }

    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}




// let prevTime = performance.now();
// const velocity = new t.Vector3();
// const direction = new t.Vector3();

let setOrbitPositions = false
let savedCameraQuaternion = new t.Quaternion();
export function movement(playerHeight, playerMass, speed, velocity, direction,
    prevTime, time, camera, physics) {

    if (!overheadview) {
        if (setOrbitPositions) {
            camera.quaternion.copy(savedCameraQuaternion);
        }
        setOrbitPositions = false
        pointerLockControls.enabled = true
        orbitControls.enabled = false
        const delta = (time - prevTime) / 1000; //change in time

        velocity.x -= velocity.x * 0.8 * delta;
        velocity.z -= velocity.z * 0.8 * delta;

        const g = 9.81;

        velocity.y -= g * playerMass * delta; // 100.0 = mass

        //Number(boolean) treats as 1 or 0 based on t or f
        direction.z = Number(moveForward) - Number(moveBackward);//cant go backwards and forward at same time
        direction.x = Number(moveRight) - Number(moveLeft);//cant go left and right at same time
        direction.normalize();

        // v = 
        if (moveForward || moveBackward)
            velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight)
            velocity.x -= direction.x * speed * delta;

        const forward = new t.Vector3();
        const right = new t.Vector3();

        pointerLockControls.object.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, new t.Vector3(0, 1, 0)).normalize();

        // build the move vector relative to where the camera is looking
        const moveVec = new t.Vector3();
        moveVec.addScaledVector(forward, -velocity.z * delta);
        moveVec.addScaledVector(right, -velocity.x * delta);

        const moveVector = new physics.RAPIER.Vector3(
            moveVec.x,
            velocity.y * delta, // gravity
            moveVec.z
        );


        characterController.computeColliderMovement(player.userData.collider, moveVector);
        const translation = characterController.computedMovement();
        const position = player.userData.collider.translation();

        position.x += translation.x;
        position.y += translation.y;
        position.z += translation.z;

        player.userData.collider.setTranslation(position);
        player.position.set(position.x, position.y, position.z);

        pointerLockControls.object.position.set(position.x, position.y, position.z)
    } else {
        if (pointerLockControls.isLocked) {
            pointerLockControls.unlock()
        }
        pointerLockControls.enabled = false

        orbitControls.enabled = true

        if (!setOrbitPositions) {
            savedCameraQuaternion.copy(camera.quaternion);
            camera.position.x = player.position.x
            camera.position.y = 60
            camera.position.z = player.position.z
            orbitControls.target.set(player.position.x, 0, player.position.z);
            camera.lookAt(player.position.x, 0, player.position.z)
            setOrbitPositions = true
        }


    }





}




export function setControls(camera, canvas, mw, ww, mh) {

    pointerLockControls = new PointerLockControls(camera, canvas)
    orbitControls = new OrbitControls(camera, canvas)

    canvas.addEventListener('click', () => {
        pointerLockControls.lock();
    });
    orbitControls.enabled = false;





}



