//what it is based on -> https://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking

/**
 *  What we need for the generator
 * 1. grid (2d array)
 * 2. cell object (4 variables north, south, east, west all initilized to one for 
 * each wall to be rendered, and a true false value for if it has been visited)
 * 
 */

import * as t from 'three';
import rapier from '@dimforge/rapier3d-compat';
await rapier.init();
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class Maze {
    //number of cells in x, number of cells in z,
    //geometry of wall, material of wall, scene its in, physics it uses
    constructor(mazeWidth, mazeHeight, wallWidth, wallHeight, wallDepth, scene, physics) {
        this.width = mazeWidth;
        this.height = mazeHeight;
        this.geometry = new t.BoxGeometry(wallWidth, wallHeight, wallDepth);
        this.scene = scene;
        this.physics = physics;
        this.grid;
        this.wallWidth = wallWidth;
        this.wallHeight = wallHeight;
        this.wallDepth = wallDepth;
        this.dx = { "E": 1, "W": -1, "N": 0, "S": 0 }
        this.dy = { "E": 0, "W": 0, "N": -1, "S": 1 }
        this.opposite = { "E": "W", "W": "E", "N": "S", "S": "N" }
        this.geometries = []
        this.walls = []

    }

    generategrid() {
        let grid = [];
        for (let i = 0; i < this.height; i++) {
            let a = []
            for (let j = 0; j < this.width; j++) {
                a.push({ "N": 1, "S": 1, "E": 1, "W": 1, v: false })
            }
            grid.push(a)
        }

        this.grid = grid;
    }

    //cx and cy repersent starting cell
    generateMaze(cx, cy) {
        let directions = ["E", "W", "N", "S"].sort(() => Math.random() - 0.5);

        directions.forEach((d) => {
            let nx = cx + this.dx[d]
            let ny = cy + this.dy[d]
            //valid cell
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && !this.grid[ny][nx].v) {
                this.grid[ny][nx].v = true;
                this.grid[cy][cx][d] -= 1;
                let opposite = this.opposite[d]
                this.grid[ny][nx][opposite] -= 1
                this.generateMaze(nx, ny);
            }
        })



    }

    renderMaze(cx, cy, gap) {
        this.generategrid();
        this.grid[cx][cy].v = true;
        this.generateMaze(cx, cy);


        for (let i = 0; i < this.grid.length; i++) {


            for (let j = 0; j < this.grid[0].length; j++) {
                let xpos = this.wallWidth * j;
                let zpos = this.wallWidth * i;

                let cell = this.grid[i][j];

                if (cell["N"]) {
                    this.makeWall(xpos, zpos, 0, 0xFFFFFF)//WHITE
                }
                if (cell["S"]) {
                    this.makeWall(xpos, zpos + this.wallWidth, 0, 0x000000)//BLACK
                }
                if (cell["W"]) {
                    this.makeWall(xpos - this.wallWidth / 2, zpos + this.wallWidth / 2, Math.PI / 2, 0x0000FF) //BLUE
                }
                if (cell["E"]) {
                    this.makeWall(xpos + this.wallWidth / 2, zpos + this.wallWidth / 2, Math.PI / 2, 0xFF0000)//RED
                }

            }


        }

        const material = new t.MeshPhongMaterial({ color: 0x000000 });
        let merged = mergeGeometries(this.geometries, false)
        let mesh = new t.Mesh(merged, material)
        mesh.name = "currmaze"
        this.scene.add(mesh)

        //location of last square should be x:this.mazeWidth*this.wallWidth z:this.mazeLength*this.wallWidth
        let platformHeight = 0.1
        const fsm = new t.MeshPhongMaterial({ color: 0xFF0000 })
        const fsg = new t.BoxGeometry(this.wallWidth, platformHeight, this.wallWidth)
        const finalSquare = new t.Mesh(fsg, fsm)

        finalSquare.position.x = this.width * this.wallWidth - this.wallWidth / 2
        finalSquare.position.y = platformHeight / 2
        finalSquare.position.z = this.height * this.wallWidth - this.wallWidth / 2
        finalSquare.name = "finalsquare"
        this.scene.add(finalSquare)

    }

    //make with with x position, z positon, and rotation
    makeWall(x, z, r, color) {

        // const material = new t.MeshPhongMaterial({ color });
        // const cube = new t.Mesh(this.geometry, material)
        let rQuanternion = this.angleToQuaternion(r)
        let geo = this.geometry.clone()
        let matrix = new t.Matrix4().compose(
            //position
            new t.Vector3(x + this.wallWidth / 2, this.wallHeight / 2, z + this.wallDepth / 2),
            //rotation
            new t.Quaternion(rQuanternion.x, rQuanternion.y, rQuanternion.z, rQuanternion.w),
            //scale
            new t.Vector3(1, 1, 1)
        )
        geo.applyMatrix4(matrix)
        this.geometries.push(geo)


        let collider = this.physics.RAPIER.ColliderDesc.cuboid(this.wallWidth / 2, this.wallHeight / 2, this.wallDepth / 2)
            .setTranslation(x + this.wallWidth / 2, this.wallHeight / 2, z + this.wallDepth / 2)
            .setRotation(rQuanternion)

        let colliderPhys = this.physics.world.createCollider(collider)
        this.walls.push(colliderPhys)

    }

    angleToQuaternion(angle, axis = { x: 0, y: 1, z: 0 }) {
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        return {
            w: Math.cos(halfAngle),
            x: axis.x * s,
            y: axis.y * s,
            z: axis.z * s,

        };
    }

    clearMaze(scene) {
        const mazeMesh = scene.getObjectByName('currmaze');
        if (mazeMesh) {
            scene.remove(mazeMesh);
            mazeMesh.geometry.dispose(); // free the merged buffer
            mazeMesh.material.dispose();
        }

        const finalSquare = scene.getObjectByName('finalsquare');
        if (finalSquare) {
            scene.remove(finalSquare);
            finalSquare.geometry.dispose();
            finalSquare.material.dispose();
        }

        for (const collider of this.walls) {
            this.physics.world.removeCollider(collider, true);
        }
        this.walls.length = 0;

        this.geometries.forEach(g => g.dispose()); 
        this.geometries.length = 0;

    }



}

