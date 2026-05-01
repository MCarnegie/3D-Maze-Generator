import * as t from 'three';
import Ammo from 'ammo.js'
import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';
import { controlDetection, movement } from './controls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

const physics = await AmmoPhysics();
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
    const px = 0;
    const py = 2;
    const pz = 5
    //fov, aspect ratio, near(clipping plane), far(clipping plane)
    const camera = new t.PerspectiveCamera(fov, aspect,
        near, far
    );
    camera.position.set(px, py, pz);
    camera.lookAt(0, 0, 0);


    
    const controls = new PointerLockControls(camera, canvas)
    scene.add(controls.object);
    const overlay = document.getElementById("overlay")
    controlDetection();

    overlay.addEventListener('click', () => {
        controls.lock()
    })
    controls.addEventListener('lock', () => {
        overlay.style.display = 'none';
    });
    controls.addEventListener('unlock', () => {
        overlay.style.display = 'flex';
    });


    const light = new t.HemisphereLight(0xeeeeff, 0x777788, 2.5);
    light.position.set(0.5, 1, 0.75);
    scene.add(light)




    const planeg = new t.PlaneGeometry(2000, 2000, 100, 100)
    const planem = new t.MeshBasicMaterial({ color: 0x808080 })
    const plane = new t.Mesh(planeg, planem)
    plane.rotation.x = Math.PI * -.5;
    scene.add(plane)

    const helper = new t.BoxHelper(plane, 0xffff00);
    scene.add(helper)

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

    function makeCubeInstance(geometry, color, x, y, z) {
        const material = new t.MeshPhongMaterial({ color });
        const cube = new t.Mesh(geometry, material)
        scene.add(cube)

        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        return cube
    }


    const cubes = [
        makeCubeInstance(cgeometry, 0x44aa88, 0, 0.5, 4),
        makeCubeInstance(cgeometry, 0x000000, 0, 0.5, 4),
        makeCubeInstance(cgeometry, 0xffffff, 0, 0.5, 4),
    ]

    let prevTime = performance.now();
    let pheight = 10;
    let pmass = 100;
    let pspeed = 800;
    function render() {
        const time = performance.now();

        movement(pheight,pmass,pspeed,new t.Vector3(), new t.Vector3(),prevTime, time, controls)
        prevTime = time;
        
        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();