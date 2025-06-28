import { Player } from '../Games Objects/player.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

    }

    create() {
        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.player = new Player(this, 100, 450);

        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        
        this.highScore = localStorage.getItem('highScore') || 0;
        // Reset score to 0 when starting a new game
        this.score = 0;

        // Level system
        this.currentLevel = 1;
        this.nextLevelScore = 500; // Score needed for next level
        this.levelScoreIncrement = 500; // Points between levels

        // Lives system
        this.lives = 2; // Starting lives
        this.nextExtraLife = 200; // Score needed for next extra life
        this.extraLifeIncrement = 200; // Starting increment amount
        this.incrementIncrease = 50; // How much more each subsequent life costs

        // High score on top left, score below it, lives in top middle, level in top right
        this.highScoreText = this.add.text(16, 16, 'Personal Best: ' + this.highScore, { fontsize: '32px', fill: '#fff'});
        this.scoreText = this.add.text(16, 48, 'Score: 0', { fontSize: '24px', fill: '#fff'});
        this.livesText = this.add.text(400, 16, 'Lives: ' + this.lives, { fontSize: '32px', fill: '#ff0000'}).setOrigin(0.5, 0);
        this.levelText = this.add.text(784, 16, 'Level: ' + this.currentLevel, { fontsize: '32px', fill: '#00ff00'}).setOrigin(1, 0);

        this.bombs = this.physics.add.group();

        this.physics.add.collider(this.bombs, this.platforms);
        this.playerBombCollider = this.physics.add.collider(this.player,this.bombs, this.hitBomb, null, this);

        // Track jump key state to prevent continuous jumping
        this.jumpKeyPressed = false;

        // Track invincibility state to prevent multiple hits
        this.playerInvincible = false;

        // Release the first bomb immediately when the game starts
        this.releasedBomb();

    }

    update(time) {
        // Update player jump tracking
        this.player.update();
        
        if (this.cursors.left.isDown){
            this.player.moveLeft();
        }
        else if (this.cursors.right.isDown){
            this.player.moveRight();
        }
        else{
            this.player.idle();
        }

        // Handle jump input - only jump on key press, not while held
        if (this.cursors.up.isDown && !this.jumpKeyPressed) {
            this.player.jump();
            this.jumpKeyPressed = true;
        } else if (!this.cursors.up.isDown) {
            this.jumpKeyPressed = false;
        }

        // Handle fast fall when down key is pressed
        if (this.cursors.down.isDown) {
            this.player.fastFall();
        }

    }

    collectStar (player, star){
        star.disableBody(true, true);

        this.score += 9;
        this.scoreText.setText('score: ' + this.score);

        // Check for extra life
        if (this.score >= this.nextExtraLife) {
            this.lives++;
            this.livesText.setText('Lives: ' + this.lives);
            
            // Show extra life notification
            let extraLifeText = this.add.text(400, 200, 'EXTRA LIFE!', {
                fontFamily: 'Arial Black',
                fontSize: 48,
                color: '#00ff00',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            
            // Make the text flash and then disappear
            this.tweens.add({
                targets: extraLifeText,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    extraLifeText.destroy();
                }
            });
            
            // Increase the threshold for next extra life
            this.nextExtraLife += this.extraLifeIncrement;
            
            // Increase the increment for subsequent lives by 100 more points
            this.extraLifeIncrement += this.incrementIncrease;
        }

        // Check for level progression
        if (this.score >= this.nextLevelScore) {
            this.currentLevel++;
            this.levelText.setText('Level: ' + this.currentLevel);
            this.nextLevelScore += this.levelScoreIncrement;
            
            // Show level up notification
            let levelUpText = this.add.text(400, 150, 'LEVEL ' + this.currentLevel + '!', {
                fontFamily: 'Arial Black',
                fontSize: 56,
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: levelUpText,
                alpha: 0,
                duration: 2500,
                ease: 'Power2',
                onComplete: () => {
                    levelUpText.destroy();
                }
            });
            
            // Apply level changes
            this.applyLevelChanges();
        }

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.highScoreText.setText('high score: ' + this.highScore);
        }

        if (this.stars.countActive(true) === 0){
            this.stars.children.iterate(function (child){
                child.enableBody(true, child.x, 0, true, true);
            });

            this.releasedBomb();
        }

    }

hitBomb (player, bomb){
    // Check if player is already invincible to prevent multiple hits
    if (this.playerInvincible) {
        // Just destroy the bomb but don't lose another life
        bomb.destroy();
        return;
    }
    
    // Set invincible flag immediately and disable ALL bomb collisions
    this.playerInvincible = true;
    this.physics.world.removeCollider(this.playerBombCollider);
    
    // Lose a life
    this.lives--;
    this.livesText.setText('Lives: ' + this.lives);
    
    // Debug: Log the current lives count
    console.log('Hit by bomb! Lives remaining:', this.lives);
    
    // Remove the bomb that hit the player
    bomb.destroy();
    
    // Destroy any other bombs that might be touching the player right now
    this.bombs.children.entries.forEach(otherBomb => {
        if (this.physics.overlap(this.player, otherBomb)) {
            console.log('Destroying additional overlapping bomb');
            otherBomb.destroy();
        }
    });
    
    if (this.lives <= 0) {
        // Game over - no more lives
        console.log('Game over triggered - lives:', this.lives);
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');

        // Store the final score in the registry so GameOver scene can access it
        this.registry.set('finalScore', this.score);
        
        // Update high score if necessary
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        // Transition to GameOver scene after a brief delay
        this.time.delayedCall(2000, () => {
            this.scene.start('GameOver');
        });
    } else {
        // Still have lives - make player invincible briefly and flash
        console.log('Player still has lives:', this.lives, '- continuing game');
        player.setTint(0xff0000);
        
        // Flash effect with longer duration for better visibility
        this.tweens.add({
            targets: player,
            alpha: 0.3,
            duration: 150,
            yoyo: true,
            repeat: 20, // Even longer invincibility period
            onComplete: () => {
                player.setTint(0xffffff); // Reset to normal color
                player.alpha = 1;
                // Reset invincible flag and re-enable bomb collision
                this.playerInvincible = false;
                this.playerBombCollider = this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
                console.log('Invincibility ended - collision re-enabled');
            }
        });
        
        // Show life lost notification
        let lifeLostText = this.add.text(400, 250, 'LIFE LOST! Lives: ' + this.lives, {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: lifeLostText,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                lifeLostText.destroy();
            }
        });
    }
}

    releasedBomb(){
        let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        
        // Increase bomb speed and count based on level
        const baseSpeed = 200;
        const levelSpeedMultiplier = this.currentLevel * 30;
        const bombSpeed = baseSpeed + levelSpeedMultiplier;
        
        bomb.setVelocity(Phaser.Math.Between(-bombSpeed, bombSpeed), 20);
        
        // Add extra bombs at higher levels
        if (this.currentLevel >= 3) {
            this.time.delayedCall(500, () => {
                this.createAdditionalBomb();
            });
        }
        
        if (this.currentLevel >= 5) {
            this.time.delayedCall(1000, () => {
                this.createAdditionalBomb();
            });
        }
    }

    createAdditionalBomb() {
        let x = Phaser.Math.Between(50, 750);
        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        
        const baseSpeed = 200;
        const levelSpeedMultiplier = this.currentLevel * 30;
        const bombSpeed = baseSpeed + levelSpeedMultiplier;
        
        bomb.setVelocity(Phaser.Math.Between(-bombSpeed, bombSpeed), 20);
    }

    applyLevelChanges() {
        // Change background asset color based on level
        const colors = [
            0xffffff,
            0xffd700,
            0xff1493, // level 1: White (normal)
            0x9370DB,
            0xB03060,
            0xdc143c, // Level 2: 
            0x000080  // Level 7+: Navy Blue
        ];
        
        const colorIndex = Math.min(this.currentLevel - 1, colors.length - 1);
        
        // Find the background image and change its tint
        this.children.list.forEach(child => {
            if (child.texture && child.texture.key === 'sky') {
                child.setTint(colors[colorIndex]);
            }
        });
        
        // Increase gravity slightly each level
        this.physics.world.gravity.y = 500 + (this.currentLevel * 20);
        
        // Show level info
        let levelInfoText = this.add.text(400, 300, 
            'Level ' + this.currentLevel + '\n' +
            'Faster bombs!\n' +
            (this.currentLevel >= 3 ? 'More bombs!\n' : '') +
            'Higher gravity!', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: levelInfoText,
            alpha: 0,
            duration: 3000,
            ease: 'Power2',
            onComplete: () => {
                levelInfoText.destroy();
            }
        });
    }

}