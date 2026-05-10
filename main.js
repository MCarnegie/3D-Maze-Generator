import * as t from 'three';
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';
import { controlDetection, movement, createp } from './controls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Maze } from './Generator.js';

const mazeWidth = 20;
const mazeHeight = 20;
const wallWidth = 3;
const wallHeight = 5;
const wallDepth = 0.1;


const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

const physics = await RapierPhysics();

const vertex = new t.Vector3();
const color = new t.Color();

function main() {

    const canvas = document.querySelector('#c');
    //renderer
    const renderer = new t.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //scene
    const scene = new t.Scene();
    scene.background = new t.Color(0xffffff);
    scene.fog = new t.Fog(0xffffff, 0, 750);

    physics.addScene(scene)

    let physicsHelper = new RapierHelper(physics.world)
    scene.add(physicsHelper)

    const fov = 90;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 1;
    const far = 1000;
    const px = 2;
    const py = 80;//should be 2
    const pz = 5;//should be 8
    //fov, aspect ratio, near(clipping plane), far(clipping plane)




    const camera = new t.PerspectiveCamera(fov, aspect,
        near, far
    );
    camera.position.set(px, py, pz);

    const controls = new OrbitControls(camera, canvas)
    scene.add(controls.object);
    camera.lookAt(0, 0, 0)

    // const controls = new PointerLockControls(camera, canvas)
    // scene.add(controls.object);
    // const overlay = document.getElementById("overlay")
    // controlDetection();

    // overlay.addEventListener('click', () => {
    //     controls.lock()
    // })
    // controls.addEventListener('lock', () => {
    //     overlay.style.display = 'none';
    // });
    // controls.addEventListener('unlock', () => {
    //     overlay.style.display = 'flex';
    // });


    const light = new t.HemisphereLight(0xeeeeff, 0x777788, 2.5);
    light.position.set(0.5, 1, 0.75);
    scene.add(light)




    const planeg = new t.BoxGeometry(500, 0.5, 500)
    const planem = new t.MeshBasicMaterial({ color: 0x808080 })
    const plane = new t.Mesh(planeg, planem)

    plane.position.y = -0.25;
    physics.addMesh(plane)
    scene.add(plane)
    const helpter = new t.BoxHelper(plane, 0xffff00);
    scene.add(helpter)


    let pheight = 3;
    let pwidth = 1;
    let pmass = 100;
    let pspeed = 800;
    //player charector
    let p = createp(px, py, pz, physics, scene, py, pwidth);



    const boxWidth = 5;
    const boxHeight = 0.01;
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

    const axesHelper = new t.AxesHelper(5);
    scene.add(axesHelper);




    function makeCubeInstance(geometry, color, x, y, z, r) {
        const material = new t.MeshPhongMaterial({ color });
        const cube = new t.Mesh(geometry, material)


        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        cube.rotation.y = r;
        physics.addMesh(cube, 100000)
        //scene.add(cube)
        return cube
    }


    const cubes = [
        // makeCubeInstance(cgeometry, 0x44aa88, 3, 0, -3, Math.PI),
        // makeCubeInstance(cgeometry, 0x000000, 0, 0, 0,Math.PI/2),
        // makeCubeInstance(cgeometry, 0x44aa88, 3, 0, 3, Math.PI),

    ]




    let prevTime = performance.now();
    let maze = new Maze(mazeWidth, mazeHeight, wallWidth, wallHeight, wallDepth, scene, physics)
    console.log(camera.position.y)

    //for orbital cameraso it centers on the maze!!!
    camera.position.x = mazeWidth / 2 * wallWidth
    camera.position.z = mazeHeight / 2 * wallWidth
    controls.target.set(mazeWidth / 2 * wallWidth, 0, mazeHeight / 2 * wallWidth);
    camera.lookAt(mazeWidth / 2 * wallWidth, 0, mazeHeight / 2 * wallWidth)

    maze.renderMaze(0, 0, 5)
    function render() {
        const time = performance.now();

        // movement(pheight, pmass, pspeed, new t.Vector3(), new t.Vector3(), prevTime, time, 
        // controls,camera,physics)
        prevTime = time;

        helpter.update();
        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}



main();