import { Player } from '../Games Objects/player.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

    }

    create() {
        // Scale background to fit the new screen size (1200x800)
        let bg = this.add.image(600, 400, 'sky');
        bg.setScale(1200 / bg.width, 800 / bg.height);

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(600, 830, "ground").setScale(3).refreshBody();

        
        this.platforms.create(800, 500, 'ground').setScale(.7, 0.3).refreshBody();
        this.platforms.create(900, 300, 'ground').setScale(1.2, 0.3).refreshBody();
        this.platforms.create(-150, 100, 'ground').setScale(1, 0.3).refreshBody(); //top left
        this.platforms.create(700, 600, 'ground').setScale(1, 0.3).refreshBody();
        this.platforms.create(200, 300, 'ground').setScale(.5, 0.3).refreshBody();

        this.player = new Player(this, 100, 550);

        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Add SPACE key for barrier activation
        this.cursors.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Create stars with random positions and movement
        this.createMovingStars();

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
        this.livesText = this.add.text(600, 16, 'Lives: ' + this.lives, { fontSize: '32px', fill: '#ff0000'}).setOrigin(0.5, 0);
        this.levelText = this.add.text(1184, 16, 'Level: ' + this.currentLevel, { fontsize: '32px', fill: '#00ff00'}).setOrigin(1, 0);

        this.bombs = this.physics.add.group();

        this.physics.add.collider(this.bombs, this.platforms);
        this.playerBombCollider = this.physics.add.collider(this.player,this.bombs, this.hitBomb, null, this);

        // Track jump key state to prevent continuous jumping
        this.jumpKeyPressed = false;

        // Track invincibility state to prevent multiple hits
        this.playerInvincible = false;
        
        // Track barrier key state to prevent continuous activation
        this.barrierKeyPressed = false;
        
        // Create barrier UI elements (initially hidden)
        this.createBarrierUI();

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
        
        // Handle barrier activation with SPACE key (only when unlocked)
        if (this.cursors.space.isDown && !this.barrierKeyPressed) {
            if (this.player.activateBarrier()) {
                this.barrierKeyPressed = true;
            }
        } else if (!this.cursors.space.isDown) {
            this.barrierKeyPressed = false;
        }
        
        // Update barrier UI
        this.updateBarrierUI();
        
        // Apply magnetic force to bombs when barrier is active
        if (this.player.barrierActive) {
            this.player.applyMagneticForce(this.bombs);
        }

        // Add dynamic flying behavior to stars only at level 3+
        if (this.currentLevel >= 3) {
            this.stars.children.entries.forEach(star => {
                // Occasionally change direction for more erratic flying
                if (Phaser.Math.Between(1, 300) === 1) {
                    star.setVelocityX(Phaser.Math.Between(-180, 180));
                    star.setVelocityY(Phaser.Math.Between(-150, 150));
                }
                
                // Add floating/drifting behavior
                if (Phaser.Math.Between(1, 200) === 1) {
                    // Small velocity adjustments for natural floating
                    star.body.velocity.x += Phaser.Math.Between(-20, 20);
                    star.body.velocity.y += Phaser.Math.Between(-20, 20);
                    
                    // Cap maximum velocity to prevent stars from going too fast
                    if (Math.abs(star.body.velocity.x) > 200) {
                        star.body.velocity.x = star.body.velocity.x > 0 ? 200 : -200;
                    }
                    if (Math.abs(star.body.velocity.y) > 180) {
                        star.body.velocity.y = star.body.velocity.y > 0 ? 180 : -180;
                    }
                }
                
                // Add occasional "burst" flying for excitement
                if (Phaser.Math.Between(1, 800) === 1) {
                    star.setVelocity(
                        Phaser.Math.Between(-250, 250),
                        Phaser.Math.Between(-200, 200)
                    );
                    // Increase rotation speed during burst
                    star.setAngularVelocity(Phaser.Math.Between(-500, 500));
                }
            });
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
            let extraLifeText = this.add.text(600, 200, 'EXTRA LIFE!', {
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

        // Check for level progression - removed score-based leveling
        // Now levels only increase when all stars are collected!

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.highScoreText.setText('high score: ' + this.highScore);
        }

        if (this.stars.countActive(true) === 0){
            // Level up when all stars are collected!
            this.currentLevel++;
            this.levelText.setText('Level: ' + this.currentLevel);
            
            // Pause the game for level-up notifications
            this.physics.pause();
            this.input.keyboard.enabled = false;
            
            // Apply level changes first
            this.applyLevelChanges();
            
            // Update player abilities based on new level
            this.player.updateJumpAbilities(this.currentLevel);
            
            // Create upgrade notification text that stays longer
            let upgradeLines = [
                'LEVEL ' + this.currentLevel + ' REACHED!',
                '',
                'DIFFICULTY INCREASED:',
                '• Bombs are faster',
                '• Higher gravity'
            ];
            
            // Add level-specific upgrades
            if (this.currentLevel >= 3) {
                upgradeLines.push('• More bombs spawn');
                upgradeLines.push('• Stars now fly around!');
            }
            
            if (this.currentLevel === 2) {
                upgradeLines.splice(3, 0, '', 'NEW ABILITY UNLOCKED:', '• Double jump available!', '');
            }
            
            if (this.currentLevel === 3) {
                upgradeLines.splice(3, 0, '', 'NEW ABILITY UNLOCKED:', '• Fast fall available!', '• Press DOWN while falling', '');
            }
            
            if (this.currentLevel === 4) {
                upgradeLines.splice(3, 0, '', 'NEW ABILITY UNLOCKED:', '• Triple jump available!', '');
            }
            
            if (this.currentLevel === 5) {
                upgradeLines.splice(3, 0, '', 'NEW ABILITY UNLOCKED:', '• Magnetic barrier pushes bombs away!', '• Press SPACE to activate', '');
            }
            
            upgradeLines.push('', 'More stars to collect!');
            
            let upgradeText = this.add.text(600, 300, upgradeLines.join('\n'), {
                fontFamily: 'Arial Black',
                fontSize: 36,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
                align: 'center'
            }).setOrigin(0.5);
            
            // Show "Get Ready!" countdown after longer pause
            this.time.delayedCall(6000, () => {
                let getReadyText = this.add.text(600, 400, 'GET READY!', {
                    fontFamily: 'Arial Black',
                    fontSize: 48,
                    color: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5);
                
                // Remove the upgrade text and show get ready
                upgradeText.destroy();
                
                this.tweens.add({
                    targets: getReadyText,
                    alpha: 0,
                    duration: 1500,
                    ease: 'Power2',
                    onComplete: () => {
                        getReadyText.destroy();
                        
                        // Resume game after countdown
                        this.physics.resume();
                        this.input.keyboard.enabled = true;
                        
                        // Clear all cursor key states to prevent automatic movement
                        this.cursors.left.isDown = false;
                        this.cursors.right.isDown = false;
                        this.cursors.up.isDown = false;
                        this.cursors.down.isDown = false;
                        this.cursors.space.isDown = false;
                        
                        // Reset barrier key state
                        this.barrierKeyPressed = false;
                        this.jumpKeyPressed = false;
                        
                        // Increase number of stars based on level for more challenge
                        let numStars = Math.min(12 + Math.floor(this.currentLevel / 2), 20); // Max 20 stars
                        
                        // Respawn stars for the new level
                        for (let i = 0; i < numStars; i++) {
                            this.createFlyingStar();
                        }

                        this.releasedBomb();
                    }
                });
            });
        }

    }

hitBomb (player, bomb){
    // Check if barrier is active - prevent damage (magnetic field should push bombs away)
    if (player.deflectsBombs()) {
        // Barrier is active, apply extremely powerful push force as failsafe
        const angle = Phaser.Math.Angle.Between(player.x, player.y, bomb.x, bomb.y);
        bomb.setVelocity(
            Math.cos(angle) * 1800, // Extremely strong failsafe force (was 1200)
            Math.sin(angle) * 1400   // (was 900)
        );
        bomb.setTint(0x00ffff);
        
        // Add intense screen shake for dramatic effect
        this.cameras.main.shake(200, 0.05);
        
        this.time.delayedCall(500, () => {
            if (bomb.active) bomb.setTint(0xffffff);
        });
        return; // No damage taken
    }
    
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
        let lifeLostText = this.add.text(600, 350, 'LIFE LOST! Lives: ' + this.lives, {
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
        let x = (this.player.x < 600) ? Phaser.Math.Between(600, 1200) : Phaser.Math.Between(0, 600);

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
        let x = Phaser.Math.Between(50, 1150);
        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        
        const baseSpeed = 200;
        const levelSpeedMultiplier = this.currentLevel * 30;
        const bombSpeed = baseSpeed + levelSpeedMultiplier;
        
        bomb.setVelocity(Phaser.Math.Between(-bombSpeed, bombSpeed), 20);
    }

    createMovingStars() {
        // Create stars group
        this.stars = this.physics.add.group();
        
        // Create 12 flying stars at random positions
        for (let i = 0; i < 12; i++) {
            this.createFlyingStar();
        }
        
        // Set up collisions and overlaps
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    }

    createFlyingStar() {
        // Random position anywhere in the game area
        let x = Phaser.Math.Between(50, 1150);
        let y = Phaser.Math.Between(50, 700); // Can spawn anywhere vertically
        
        let star = this.stars.create(x, y, 'star');
        
        // Flying behavior only starts at level 3
        if (this.currentLevel >= 3) {
            // Disable gravity for this star so it truly flies
            star.body.setGravityY(-500); // Counteract world gravity
            
            // Set strong bounce properties for bouncing off platforms and walls
            star.setBounceY(1.0);
            star.setBounceX(1.0);
            
            // Set flying velocity - stronger movement in all directions
            star.setVelocityX(Phaser.Math.Between(-150, 150));
            star.setVelocityY(Phaser.Math.Between(-120, 120));
            
            // Enable world bounds collision so stars bounce off screen edges
            star.setCollideWorldBounds(true);
            
            // Add fast rotation for flying effect
            star.setAngularVelocity(Phaser.Math.Between(-300, 300));
            
            // Make stars slightly smaller and more transparent for flying effect
            star.setScale(0.8);
            star.setAlpha(0.9);
        } else {
            // For levels 1-2, stars are stationary and affected by gravity
            star.setBounceY(0.7);
            star.setBounceX(0.2);
            star.setCollideWorldBounds(true);
            // Normal size and opacity for stationary stars
            star.setScale(1.0);
            star.setAlpha(1.0);
        }
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
    }

    createBarrierUI() {
        // Barrier UI - positioned on the left side below score
        this.barrierLabel = this.add.text(16, 80, 'Barrier:', { fontSize: '20px', fill: '#00ffff'});
        
        // Barrier charge bar background
        this.barrierBarBg = this.add.rectangle(16, 110, 200, 20, 0x333333);
        this.barrierBarBg.setOrigin(0, 0.5);
        this.barrierBarBg.setStrokeStyle(2, 0x00ffff);
        
        // Barrier charge bar fill
        this.barrierBarFill = this.add.rectangle(18, 110, 196, 16, 0x00ffff);
        this.barrierBarFill.setOrigin(0, 0.5);
        
        // Barrier instruction text
        this.barrierInstruction = this.add.text(16, 130, 'Press SPACE to activate', { fontSize: '14px', fill: '#ffffff'});
        
        // Initially hide barrier UI
        this.setBarrierUIVisible(false);
    }
    
    updateBarrierUI() {
        if (!this.player.barrierUnlocked) {
            this.setBarrierUIVisible(false);
            return;
        }
        
        this.setBarrierUIVisible(true);
        
        // Update charge bar
        const chargePercent = this.player.barrierCharge / this.player.barrierMaxCharge;
        this.barrierBarFill.scaleX = chargePercent;
        
        // Change color based on charge level
        if (chargePercent >= 1.0) {
            this.barrierBarFill.setFillStyle(0x00ff00); // Green when ready
            this.barrierLabel.setColor('#00ff00');
            this.barrierInstruction.setText('Press SPACE to activate');
        } else if (this.player.barrierActive) {
            this.barrierBarFill.setFillStyle(0xffff00); // Yellow when active
            this.barrierLabel.setColor('#ffff00');
            this.barrierInstruction.setText('BARRIER ACTIVE!');
        } else {
            this.barrierBarFill.setFillStyle(0xff4444); // Red when charging
            this.barrierLabel.setColor('#ff4444');
            this.barrierInstruction.setText('Recharging...');
        }
    }
    
    setBarrierUIVisible(visible) {
        this.barrierLabel.setVisible(visible);
        this.barrierBarBg.setVisible(visible);
        this.barrierBarFill.setVisible(visible);
        this.barrierInstruction.setVisible(visible);
    }

}