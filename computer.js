import * as t from 'three';

//https://www.redblobgames.com/pathfinding/a-star/implementation.html

//how the computer will work;
//everytime the player enters a new square in the maze, computer will create a list of positions
//it must follow to get to the player using the A* algorithm and follow it
export class Comp {

    constructor(cx, cy, cz, physics, scene, ch, cw, hr, player, pw, time) {
        this.cx = cx
        this.cy = cy
        this.cz = cz
        this.physics = physics
        this.scene = scene
        this.ch = ch
        this.cw = cw
        this.computer
        this.hitradius = hr
        this.player = player
        this.pw = pw
        


    }
    //creates computer and adds it to world
    createc() {
        const geometry = new t.CapsuleGeometry(this.cw, this.ch, 8, 8);
        const material = new t.MeshStandardMaterial({ color: 0xFFFFFF });
        this.computer = new t.Mesh(geometry, material);
        this.computer.position.set(this.cx, this.cy, this.cz);

        this.scene.add(this.computer);

        const colliderDesc = this.physics.RAPIER.ColliderDesc.capsule(this.ch, this.cw)
            .setTranslation(this.cx, this.cy, this.cz);
        this.computer.userData.collider = this.physics.world.createCollider(colliderDesc);
    }

    
    move() {
        const offset = new t.Vector3(0, 0, -2)
        this.player.getWorldPosition(this.player.position)

        const goalPositon = this.player.position.clone().add(offset)
        
        this.computer.position.lerp(goalPositon, 0.01)

    }
    

}
    




