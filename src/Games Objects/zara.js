import Phaser from 'phaser';

export class Zara extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'zarazombie');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.setScale(0.045); // Further reduced to match other players
        this.initZaraAnimations();
    }

    initZaraAnimations() {
        // Only create if not already present
        if (!this.scene.anims.exists('zara_left')) {
            this.scene.anims.create({
                key: 'zara_left',
                frames: [
                    { key: 'zarazombie', frame: 0 },
                    { key: 'zarazombie', frame: 1 },
                    { key: 'zarazombie', frame: 2 },
                    { key: 'zarazombie', frame: 3 }
                ],
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.scene.anims.exists('zara_turn')) {
            this.scene.anims.create({
                key: 'zara_turn',
                frames: [ { key: 'zarazombie', frame: 4 } ],
                frameRate: 1
            });
        }
        if (!this.scene.anims.exists('zara_right')) {
            this.scene.anims.create({
                key: 'zara_right',
                frames: [
                    { key: 'zarazombie', frame: 5 },
                    { key: 'zarazombie', frame: 6 },
                    { key: 'zarazombie', frame: 7 },
                    { key: 'zarazombie', frame: 8 },
                    { key: 'zarazombie', frame: 0 },
                    { key: 'zarazombie', frame: 1 }
                ],
                frameRate: 10,
                repeat: -1
            });
        }
    }

    moveLeft() {
        this.setVelocityX(-200); // Or use your speed logic
        this.anims.play('zara_left', true);
    }

    moveRight() {
        this.setVelocityX(200); // Or use your speed logic
        this.anims.play('zara_right', true);
    }

    idle() {
        this.setVelocityX(0);
        this.anims.play('zara_turn');
    }
}
