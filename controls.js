let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;



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

export function movement(playerHeight, playerMass, speed, velocity, direction, prevTime, time, controls) {


    const delta = (time - prevTime) / 1000; //change in time

    velocity.x -= velocity.x * speed * delta;
    velocity.z -= velocity.z * speed * delta;

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


    controls.moveRight(- velocity.x * delta);
    controls.moveForward(- velocity.z * delta);

    //controls.object.position.y += (velocity.y * delta);


    
    // console.log(delta)

}



