//what it is based on -> https://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking

/**
 *  What we need for the generator
 * 1. grid (2d array)
 * 2. cell object (4 variables north, south, east, west all initilized to one for 
 * each wall to be rendered, and a true false value for if it has been visited)
 * 
 */

import * as t from 'three';

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
        this.wallDepth = wallDepth
        this.dx = { "E": 1, "W": -1, "N": 0, "S": 0 }
        this.dy = { "E": 0, "W": 0, "N": -1, "S": 1 }
        this.opposite = { "E": "W", "W": "E", "N": "S", "S": "N" }
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
                let xpos =this.wallWidth*j;
                let zpos = this.wallWidth*i;

                let cell = this.grid[i][j];
            
                if (cell["N"]) {
                    this.makeWall(xpos,zpos,0, 0xFFFFFF)//WHITE
                }
                if(cell["S"]){
                     this.makeWall(xpos,zpos+this.wallDepth + this.wallWidth,0, 0x000000)//BLACK
                }
                if(cell["W"]){
                     this.makeWall(xpos-this.wallWidth/2,zpos+this.wallWidth/2,Math.PI/2, 0x0000FF) //BLUE
                }
                if(cell["E"]){
                     this.makeWall(xpos+this.wallWidth/2,zpos+this.wallWidth/2,Math.PI/2, 0xFF0000)//RED
                }
                
            }
            
  
        }
        


    }

    //make with with x position, z positon, and rotation
    makeWall(x, z, r, color) {

        const material = new t.MeshPhongMaterial({ color });
        const cube = new t.Mesh(this.geometry, material)

        //adding the wall width/2 and depth/2 to the position aligns 
        //the maze to the axis of the 3d world, not really nesscary but easier
        //for debugging
        cube.position.x = x+this.wallWidth/2;
        cube.position.z = z+this.wallDepth/2;
        cube.position.y = this.wallHeight/2
        cube.rotation.y = r;
        this.physics.addMesh(cube, 0)
        this.scene.add(cube)
        return cube
    }




}

