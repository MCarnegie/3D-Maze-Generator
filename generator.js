//https://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking

/**
 *  What we need for the generator
 * 1. grid (2d array)
 * 2. cell object (4 variables north, south, east, west all initilized to one for 
 * each wall to be rendered, and a true false value for if it has been visited)
 * 
 */


export class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid;
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




}

