export class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y){
        super(scene, x, y, 'dude');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.initAnimations();
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
    if (this.body.blocked.down){
        this.setVelocityY(-500);
    }
}






}