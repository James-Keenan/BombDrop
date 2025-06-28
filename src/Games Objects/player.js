export class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y){
        super(scene, x, y, 'dude');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.initAnimations();
        
        // Air jumping properties
        this.maxJumps = 3; // Total jumps allowed (1 ground jump + 1 air jump)
        this.jumpsRemaining = this.maxJumps;
        this.wasOnGround = false;
}

initAnimations(){
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
}

moveLeft(){
    this.setVelocityX(-200);
    this.anims.play('left', true);
}

moveRight(){
    this.setVelocityX(200);
    this.anims.play('right', true);
}

idle(){
    this.setVelocityX(0);
    this.anims.play('turn');
}

jump(){
    // Allow jumping if we have jumps remaining
    if (this.jumpsRemaining > 0) {
        this.setVelocityY(-500);
        this.jumpsRemaining--;
        
        // Optional: Make air jumps slightly weaker than ground jumps
        if (!this.body.blocked.down) {
            this.setVelocityY(-400); // Weaker air jump
        }
    }
}

fastFall(){
    // Only allow fast fall when in the air and falling (positive Y velocity)
    if (!this.body.blocked.down && this.body.velocity.y > 0) {
        this.setVelocityY(800); // Fast fall speed
    }
}

// Update method to reset jumps when touching ground
update() {
    // Check if player just landed on the ground
    if (this.body.blocked.down && !this.wasOnGround) {
        this.jumpsRemaining = this.maxJumps; // Reset jumps when landing
    }
    
    // Track ground state for next frame
    this.wasOnGround = this.body.blocked.down;
}






}