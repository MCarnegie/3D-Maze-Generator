import * as t from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new t.Vector3();
const direction = new t.Vector3();
const vertex = new t.Vector3();
const color = new t.Color();

function main() {

    const canvas = document.querySelector('#c');

    const renderer = new t.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const scene = new t.Scene();
    scene.background = new t.Color(0xffffff);
    scene.fog = new t.Fog(0xffffff, 0, 750);


    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 1;
    const far = 1000;
    //fov, aspect ratio, near(clipping plane), far(clipping plane)
    const camera = new t.PerspectiveCamera(fov, aspect,
        near, far
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);


    const light = new t.HemisphereLight(0xeeeeff, 0x777788, 2.5);
    light.position.set(0.5, 1, 0.75);
    scene.add(light)


    const controls = new PointerLockControls(camera, canvas)
    scene.add(controls.object);

    const overlay = document.getElementById("overlay")

    overlay.addEventListener('click', () => {
        controls.lock()
    })
    controls.addEventListener('lock', () => {
        overlay.style.display = 'none';
    });
    controls.addEventListener('unlock', () => {
        overlay.style.display = 'flex';
    });

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

            case 'Space':
                if (canJump === true) velocity.y += 350;
                canJump = false;
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

        }

    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    raycaster = new t.Raycaster(new t.Vector3(), new t.Vector3(0, - 1, 0), 0, 10);

    const planeg = new t.PlaneGeometry(2000, 2000, 100, 100)
    const planem = new t.MeshBasicMaterial({ color: 0x808080 })
    const plane = new t.Mesh(planeg, planem)
    plane.rotation.x = Math.PI * -.5;
    scene.add(plane)


    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const cgeometry = new t.BoxGeometry(boxWidth, boxHeight, boxDepth); // object that contains all verticies and faces of the cube
    // const cmaterial = new t.MeshPhongMaterial({ color: 0x44aa88 }); //material to cover the obeject
    //all materials take an object of properties
    // const cube = new t.Mesh(cgeometry, cmaterial) //object that takes geometry and applys a material



    // const lmaterial = new t.LineBasicMaterial({color:0x0000ff});
    // const points = [];
    // points.push( new t.Vector3( - 2, 0, 0 ) );
    // points.push( new t.Vector3( 0, 2, 0 ) );
    // points.push( new t.Vector3( 2, 0, 0 ) );
    // const lgeometry = new t.BufferGeometry().setFromPoints( points );

    // const line = new t.Line(lgeometry, lmaterial)



    // scene.add(cube)// adds cube to point (0,0,0)
    // scene.add(line)

    function makeInstance(geometry, color, x, y) {
        const material = new t.MeshPhongMaterial({ color });
        const cube = new t.Mesh(geometry, material)
        scene.add(cube)

        cube.position.x = x;
        cube.position.y = y;
        return cube
    }


    const cubes = [
        makeInstance(cgeometry, 0x44aa88, 0, 0.5),
    ]

    function render() {
        const time = performance.now();

        if (controls.isLocked === true) {

            raycaster.ray.origin.copy(controls.object.position);
            raycaster.ray.origin.y -= 10;

            const intersections = raycaster.intersectObjects(objects, false);

            const onObject = intersections.length > 0;

            const delta = (time - prevTime) / 1000;

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize(); // this ensures consistent movements in all directions

            if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

            if (onObject === true) {

                velocity.y = Math.max(0, velocity.y);
                canJump = true;

            }

            controls.moveRight(- velocity.x * delta);
            controls.moveForward(- velocity.z * delta);

            controls.object.position.y += (velocity.y * delta); // new behavior

            if (controls.object.position.y < 2) {

                velocity.y = 0;
                controls.object.position.y = 2;

                canJump = true;

            }

        }

        prevTime = time;


        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();