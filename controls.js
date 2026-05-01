import * as t from 'three';
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let characterController;
let player

export function createp(px, py, pz, physics, scene, ph, pw) {
    const geometry = new t.CapsuleGeometry(pw, ph, 8, 8);
    const material = new t.MeshStandardMaterial({ color: 0x0000ff });
    player = new t.Mesh(geometry, material);
    player.position.set(px, py, pz);

    characterController = physics.world.createCharacterController(0.01);
    characterController.setApplyImpulsesToDynamicBodies(true);
    characterController.setCharacterMass(pw);
    const colliderDesc = physics.RAPIER.ColliderDesc.capsule(ph, pw).setTranslation(px, ph, pz);
    player.userData.collider = physics.world.createCollider(colliderDesc);


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

            // case 'Space':
            //     if (canJump === true) velocity.y += 350;
            //     canJump = false;
            //     break;

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

        }

    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}




// let prevTime = performance.now();
// const velocity = new t.Vector3();
// const direction = new t.Vector3();

export function movement(playerHeight, playerMass, speed, velocity, direction,
    prevTime, time, controls, camera, physics) {


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

    controls.object.getWorldDirection(forward);
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

    controls.object.position.set(position.x, position.y, position.z)


}



