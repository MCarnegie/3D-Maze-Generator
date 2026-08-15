import * as t from 'three';
import './style.css';
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';
import { controlDetection, movement, createp, getOveheadview, setControls, player, centerOrbital } from './controls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Maze } from './generator.js';
import Stats from 'three/addons/libs/stats.module.js';
import { Comp } from './computer.js'
const stats = new Stats();
document.body.appendChild(stats.dom);



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



const canvas = document.querySelector('#c');
const canvasWrap = document.getElementById('canvas-wrap');

//Setting up switching between pages
const navTabs = document.querySelectorAll('.nav-tab');
const pages = document.querySelectorAll('.page');

function showPage(name) {
    pages.forEach((p) => p.classList.toggle('is-active', p.dataset.page === name));
    navTabs.forEach((t) => t.classList.toggle('is-active', t.dataset.page === name));
    // Canvas was possibly hidden (display:none) while resized — sync it back up.
    if (name === 'project') requestAnimationFrame(onResize);
}

navTabs.forEach((tab) => {
    tab.addEventListener('click', () => showPage(tab.dataset.page));
});

// creating renderer
const renderer = new t.WebGLRenderer({ antialias: true, canvas });
//renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight, false);
renderer.setSize(1, 1, false);

//creating scene
const scene = new t.Scene();
scene.background = new t.Color(0xffffff);
scene.fog = new t.Fog(0xffffff, 0, 750);

physics.addScene(scene)


let physicsHelper = new RapierHelper(physics.world)
scene.add(physicsHelper)


//creating camera
const fov = 90;
const aspect = canvasWrap.clientWidth / canvasWrap.clientHeight;  // the canvas default
const near = 0.1;
const far = 1000;
const px = 2;
const py = 2;//should be 2
const pz = 5;//should be 8
//fov, aspect ratio, near(clipping plane), far(clipping plane)


const camera = new t.PerspectiveCamera(fov, aspect,
    near, far
);
camera.position.set(0, py, 0);


//toggling between controls
setControls(camera, canvas)
controlDetection(camera);



//creating world light
const light = new t.HemisphereLight(0xeeeeff, 0x777788, 2.5);
light.position.set(0.5, 1, 0.75);
scene.add(light)

//creating plane
let planeW = 500
let planeL = 500
const planeg = new t.BoxGeometry(planeW, 0.5, planeL)
const planem = new t.MeshBasicMaterial({ color: 0x808080 })
const plane = new t.Mesh(planeg, planem)

plane.position.x = planeW / 2
plane.position.z = planeL / 2
plane.position.y = -0.25;
physics.addMesh(plane)
scene.add(plane)
const helpter = new t.BoxHelper(plane, 0xffff00);
scene.add(helpter)

//creating player
let pheight = 3;
let pwidth = 1;
let pmass = 100;
let pspeed = 800;
//player charector




const axesHelper = new t.AxesHelper(5);
scene.add(axesHelper);



//creating maze
const mazeWidth = 80
const mazeHeight = 80;
const wallWidth = 3;
const wallHeight = 5;
const wallDepth = 0.1;


let maze = new Maze(mazeWidth, mazeHeight, wallWidth, wallHeight, wallDepth, scene, physics)

let p = createp(wallWidth / 2, py, wallWidth / 2, physics, scene, py, pwidth);
setControls(camera, canvas, mazeWidth, wallWidth, mazeHeight)
let c = new Comp(80, 2, 80, physics, scene, 3, 1, 2, player, pwidth)
//c.createc()
//render the maze
maze.renderMaze(0, 0, 5)


let prevTime = performance.now();
function render() {
    const time = performance.now();
    
         movement(pheight, pmass, pspeed, new t.Vector3(), new t.Vector3(), prevTime, time, camera, physics,
        maze)
    
   
    //c.move()

    prevTime = time;
    helpter.update();
    renderer.render(scene, camera);
    stats.update()
    requestAnimationFrame(render);
}
requestAnimationFrame(render);




function onResize() {
    const w = canvasWrap.clientWidth || 1;
    const h = canvasWrap.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

new ResizeObserver(onResize).observe(canvasWrap);
onResize();


function newMaze() {
    maze.clearMaze(scene)
    maze.renderMaze(0,0,5)
    const resetPos = { x: wallWidth / 2, y: py, z: wallWidth / 2 };
    player.userData.collider.setTranslation(resetPos);
    player.position.set(resetPos.x, resetPos.y, resetPos.z);
    
}

document.getElementById('regen-btn').addEventListener('click', newMaze);

