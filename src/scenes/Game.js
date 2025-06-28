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

        
        this.platforms.create(450, 420, 'ground').setScale(.4, 0.3).refreshBody();
        this.platforms.create(900, 300, 'ground').setScale(1.2, 0.3).refreshBody();
        this.platforms.create(-150, 100, 'ground').setScale(1, 0.3).refreshBody(); //top left
        this.platforms.create(700, 600, 'ground').setScale(1, 0.3).refreshBody();
        this.platforms.create(200, 300, 'ground').setScale(.5, 0.3).refreshBody();

        this.player = new Player(this, 100, 550);

        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Add SPACE key for barrier activation
        this.cursors.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Add T key for time freeze activation
        this.cursors.timeFreeze = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        
        // Add E key for EMP activation
        this.cursors.emp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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
        this.lives = 3; // Starting lives
        this.nextExtraLife = 200; // Score needed for next extra life
        this.extraLifeIncrement = 200; // Starting increment amount
        this.incrementIncrease = 50; // How much more each subsequent life costs

        // High score on top left, score below it, lives in top middle, level in top right
        this.highScoreText = this.add.text(16, 16, 'Personal Best: ' + this.highScore, { fontsize: '32px', fill: '#fff'});
        this.scoreText = this.add.text(16, 48, 'Score: 0', { fontSize: '24px', fill: '#fff'});
        this.livesText = this.add.text(600, 16, 'Lives: ' + this.lives, { fontSize: '32px', fill: '#ff0000'}).setOrigin(0.5, 0);
        this.levelText = this.add.text(1184, 16, 'Level: ' + this.currentLevel, { fontsize: '32px', fill: '#00ff00'}).setOrigin(1, 0);
        
        // Track barrier and time freeze key states
        this.timeFreezeKeyPressed = false;
        this.barrierKeyPressed = false;
        this.empKeyPressed = false;

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
        
        // Create time freeze UI elements (initially hidden)
        this.createTimeFreezeUI();
        
        // Create EMP UI elements (initially hidden)
        this.createEMPUI();

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
        
        // Handle time freeze activation with T key (only when unlocked)
        if (this.cursors.timeFreeze.isDown && !this.timeFreezeKeyPressed) {
            if (this.player.activateTimeFreeze()) {
                this.timeFreezeKeyPressed = true;
            }
        } else if (!this.cursors.timeFreeze.isDown) {
            this.timeFreezeKeyPressed = false;
        }
        
        // Handle EMP activation with E key (only when unlocked and available)
        if (this.cursors.emp.isDown && !this.empKeyPressed) {
            if (this.player.activateEMP(this.bombs)) {
                this.empKeyPressed = true;
            }
        } else if (!this.cursors.emp.isDown) {
            this.empKeyPressed = false;
        }
        
        // Update barrier UI
        this.updateBarrierUI();
        
        // Update time freeze UI
        this.updateTimeFreezeUI();
        
        // Update EMP UI
        this.updateEMPUI();
        
        // Update EMP UI
        this.updateEMPUI();
        
        // Apply magnetic force to bombs when barrier is active
        if (this.player.barrierActive) {
            this.player.applyMagneticForce(this.bombs);
        }
        
        // Apply star magnet effect
        this.player.applyStarMagnet(this.stars);

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
        
        // Track star collection for EMP charging
        this.player.collectStar();

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
            
            // Award tokens for completing the level
            const tokensEarned = this.currentLevel <= 2 ? 1 : 2; // 1 token for levels 1-2, then 2 tokens
            this.player.earnTokens(tokensEarned);
            this.updateTokenUI();
            
            // Award special token every 5 levels
            if (this.currentLevel % 5 === 0) {
                this.player.earnSpecialToken();
                this.updateTokenUI();
                
                // Show special token notification
                this.showSpecialTokenNotification();
            }
            
            // Pause the game for level-up notifications
            this.physics.pause();
            this.input.keyboard.enabled = false;
            
            // Apply level changes first
            this.applyLevelChanges();
            
            // Show upgrade menu instead of old ability choice
            this.showUpgradeMenu();
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
        
        // Apply slow bombs stat (permanent effect)
        const slowFactor = this.player.getBombSlowFactor();
        const finalBombSpeed = bombSpeed * slowFactor;
        
        bomb.setVelocity(Phaser.Math.Between(-finalBombSpeed, finalBombSpeed), 20 * slowFactor);
        
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
        
        // Apply slow bombs stat (permanent effect)
        const slowFactor = this.player.getBombSlowFactor();
        const finalBombSpeed = bombSpeed * slowFactor;
        
        bomb.setVelocity(Phaser.Math.Between(-finalBombSpeed, finalBombSpeed), 20 * slowFactor);
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
    
    // Update token UI
    updateTokenUI() {
        // Token UI is hidden during gameplay, only shown in upgrade menu
    }
    
    // Create time freeze UI
    createTimeFreezeUI() {
        // Time freeze UI - positioned on the right side
        this.timeFreezeLabel = this.add.text(1184, 80, 'Time Freeze:', { fontSize: '20px', fill: '#88ccff'}).setOrigin(1, 0);
        
        // Time freeze charge bar background
        this.timeFreezeBarBg = this.add.rectangle(1184, 110, 200, 20, 0x333333);
        this.timeFreezeBarBg.setOrigin(1, 0.5);
        this.timeFreezeBarBg.setStrokeStyle(2, 0x88ccff);
        
        // Time freeze charge bar fill
        this.timeFreezeBarFill = this.add.rectangle(1182, 110, 196, 16, 0x88ccff);
        this.timeFreezeBarFill.setOrigin(1, 0.5);
        
        // Time freeze instruction text
        this.timeFreezeInstruction = this.add.text(1184, 130, 'Press T to activate', { fontSize: '14px', fill: '#ffffff'}).setOrigin(1, 0);
        
        // Initially hide time freeze UI
        this.setTimeFreezeUIVisible(false);
    }
    
    updateTimeFreezeUI() {
        if (this.player.abilityRanks.timeFreeze < 1) {
            this.setTimeFreezeUIVisible(false);
            return;
        }
        
        this.setTimeFreezeUIVisible(true);
        
        // Update charge bar
        const chargePercent = this.player.timeFreezeCharge / this.player.timeFreezeMaxCharge;
        this.timeFreezeBarFill.scaleX = chargePercent;
        
        // Change color based on charge level
        if (chargePercent >= 1.0) {
            this.timeFreezeBarFill.setFillStyle(0x00ff00); // Green when ready
            this.timeFreezeLabel.setColor('#00ff00');
            this.timeFreezeInstruction.setText('Press T to activate');
        } else if (this.player.timeFreezeActive) {
            this.timeFreezeBarFill.setFillStyle(0xffff00); // Yellow when active
            this.timeFreezeLabel.setColor('#ffff00');
            this.timeFreezeInstruction.setText('TIME FROZEN!');
        } else {
            this.timeFreezeBarFill.setFillStyle(0xff4444); // Red when charging
            this.timeFreezeLabel.setColor('#ff4444');
            this.timeFreezeInstruction.setText('Recharging...');
        }
    }
    
    setTimeFreezeUIVisible(visible) {
        if (!this.timeFreezeLabel) {
            this.createTimeFreezeUI();
        }
        this.timeFreezeLabel.setVisible(visible);
        this.timeFreezeBarBg.setVisible(visible);
        this.timeFreezeBarFill.setVisible(visible);
        this.timeFreezeInstruction.setVisible(visible);
    }
    
    // Create EMP UI
    createEMPUI() {
        // EMP UI - positioned below time freeze
        this.empLabel = this.add.text(1184, 160, 'EMP:', { fontSize: '20px', fill: '#ffff00'}).setOrigin(1, 0);
        
        // EMP charge bar background
        this.empBarBg = this.add.rectangle(1184, 190, 200, 20, 0x333333);
        this.empBarBg.setOrigin(1, 0.5);
        this.empBarBg.setStrokeStyle(2, 0xffff00);
        
        // EMP charge bar fill
        this.empBarFill = this.add.rectangle(1182, 190, 196, 16, 0xffff00);
        this.empBarFill.setOrigin(1, 0.5);
        
        // EMP instruction text
        this.empInstructionText = this.add.text(1184, 210, 'Press E to activate', { fontSize: '16px', fill: '#cccccc'}).setOrigin(1, 0);
        
        // Hide UI initially (will be shown when unlocked)
        this.empLabel.setVisible(false);
        this.empBarBg.setVisible(false);
        this.empBarFill.setVisible(false);
        this.empInstructionText.setVisible(false);
    }
    
    // Update EMP UI
    updateEMPUI() {
        if (this.player.empUnlocked) {
            // Show EMP UI elements
            this.empLabel.setVisible(true);
            this.empBarBg.setVisible(true);
            this.empBarFill.setVisible(true);
            this.empInstructionText.setVisible(true);
            
            // Update charge bar based on stars collected
            const chargePercentage = Math.min(this.player.starsCollected / this.player.starsNeededForEMP, 1);
            this.empBarFill.scaleX = chargePercentage;
            
            // Update text based on availability
            if (this.player.empAvailable) {
                this.empLabel.setText('EMP: READY');
                this.empLabel.setTint(0x00ff00);
                this.empBarFill.setFillStyle(0x00ff00);
                this.empInstructionText.setText('Press E to activate');
            } else {
                this.empLabel.setText(`EMP: ${this.player.starsCollected}/${this.player.starsNeededForEMP}`);
                this.empLabel.setTint(0xffff00);
                this.empBarFill.setFillStyle(0xffff00);
                this.empInstructionText.setText('Collect stars to charge');
            }
        } else {
            // Hide EMP UI elements when not unlocked
            this.empLabel.setVisible(false);
            this.empBarBg.setVisible(false);
            this.empBarFill.setVisible(false);
            this.empInstructionText.setVisible(false);
        }
    }

    showUpgradeMenu() {
        // Create upgrade menu background
        let menuBackground = this.add.rectangle(600, 400, 1100, 650, 0x000000, 0.9);
        
        // Title with level info
        let title = this.add.text(600, 120, `LEVEL ${this.currentLevel} COMPLETE!`, {
            fontFamily: 'Arial Black',
            fontSize: 36,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Tokens earned notification
        const tokensEarned = this.currentLevel <= 2 ? 1 : 2;
        let tokensEarnedText = this.add.text(600, 160, `+${tokensEarned} Token${tokensEarned > 1 ? 's' : ''} Earned!`, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Current tokens display
        let currentTokensText = this.add.text(600, 200, `Tokens: ${this.player.tokens}  Special: ${this.player.specialTokens}`, {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Section headers
        let regularHeader = this.add.text(300, 250, 'REGULAR UPGRADES', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        let premiumHeader = this.add.text(900, 250, '★ PREMIUM UPGRADES ★', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Store UI elements for cleanup
        this.upgradeMenuElements = [menuBackground, title, tokensEarnedText, currentTokensText, regularHeader, premiumHeader];
        
        // Create upgrade cards
        this.createUpgradeCards();
        
        // Create continue button and ESC instruction
        this.createContinueButton();
        
        // Add ESC key listener
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => {
            this.closeUpgradeMenu();
        });
    }
    
    createUpgradeCards() {
        const regularUpgrades = [
            { name: 'jump', title: this.player.getJumpUpgradeName(), icon: '⬆', x: 150, y: 350 },
            { name: 'speed', title: this.player.getSpeedUpgradeName(), icon: '»', x: 300, y: 350 },
            { name: 'fastFall', title: 'Fast Fall', icon: '⬇', x: 450, y: 350 },
            { name: 'slowBombs', title: this.player.getSlowBombsUpgradeName(), icon: '🐌', x: 150, y: 500 },
            { name: 'starMagnet', title: this.player.getStarMagnetUpgradeName(), icon: '🧲', x: 300, y: 500 }
        ];
        
        const premiumUpgrades = [
            { name: 'barrier', title: 'Barrier', icon: '⦿', x: 750, y: 350 },
            { name: 'timeFreeze', title: 'Time Freeze', icon: '⏰', x: 900, y: 350 },
            { name: 'emp', title: 'EMP', icon: '⚡', x: 1050, y: 350 }
        ];
        
        // Create regular upgrade cards
        regularUpgrades.forEach(upgrade => {
            this.createUpgradeCard(upgrade, false);
        });
        
        // Create premium upgrade cards
        premiumUpgrades.forEach(upgrade => {
            this.createUpgradeCard(upgrade, true);
        });
    }
    
    createUpgradeCard(upgrade, isPremium) {
        const currentRank = this.player.abilityRanks[upgrade.name];
        const maxRank = this.player.getMaxRank(upgrade.name);
        const canUpgrade = this.player.canUpgrade(upgrade.name);
        const cost = this.player.getUpgradeCost(upgrade.name, currentRank);
        
        // Card background
        const cardWidth = 120;
        const cardHeight = 120;
        let card = this.add.rectangle(upgrade.x, upgrade.y, cardWidth, cardHeight, canUpgrade ? 0x004488 : 0x333333, 1);
        card.setStrokeStyle(3, isPremium ? 0xff00ff : 0x00ffff);
        
        if (canUpgrade) {
            card.setInteractive();
        }
        
        // Icon
        let icon = this.add.text(upgrade.x, upgrade.y - 30, upgrade.icon, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Title
        let title = this.add.text(upgrade.x, upgrade.y - 5, upgrade.title, {
            fontFamily: 'Arial Black',
            fontSize: 12,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Rank display
        let rankText = `${currentRank}/${maxRank}`;
        if (currentRank >= maxRank) rankText = 'MAX';
        
        let rank = this.add.text(upgrade.x, upgrade.y + 15, rankText, {
            fontFamily: 'Arial Black',
            fontSize: 10,
            color: currentRank >= maxRank ? '#00ff00' : '#ffffff'
        }).setOrigin(0.5);
        
        // Cost display
        let costText = '';
        if (currentRank >= maxRank) {
            costText = 'MAXED';
        } else if (!canUpgrade) {
            if (cost.specialTokens > 0) {
                costText = `${cost.tokens}T + ${cost.specialTokens}S`;
            } else {
                costText = `${cost.tokens}T`;
            }
        } else {
            if (cost.specialTokens > 0) {
                costText = `${cost.tokens}T + ${cost.specialTokens}S`;
            } else {
                costText = `${cost.tokens}T`;
            }
        }
        
        let costColor = '#cccccc';
        if (currentRank >= maxRank) costColor = '#00ff00';
        else if (canUpgrade) costColor = isPremium ? '#ff00ff' : '#ffff00';
        else costColor = '#ff4444';
        
        let costDisplay = this.add.text(upgrade.x, upgrade.y + 35, costText, {
            fontFamily: 'Arial',
            fontSize: 10,
            color: costColor
        }).setOrigin(0.5);
        
        // Premium star indicator
        if (isPremium) {
            let star = this.add.text(upgrade.x + 45, upgrade.y - 45, '★', {
                fontFamily: 'Arial Black',
                fontSize: 16,
                color: '#ff00ff'
            }).setOrigin(0.5);
            this.upgradeMenuElements.push(star);
        }
        
        // Store elements
        this.upgradeMenuElements.push(card, icon, title, rank, costDisplay);
        
        // Button interactions
        if (canUpgrade) {
            card.on('pointerover', () => {
                card.setFillStyle(0x0066aa);
            });
            
            card.on('pointerout', () => {
                card.setFillStyle(0x004488);
            });
            
            card.on('pointerdown', () => {
                this.purchaseUpgrade(upgrade.name);
            });
        }
    }
    
    purchaseUpgrade(abilityName) {
        if (this.player.upgradeAbility(abilityName)) {
            // Update token display
            this.updateTokenUI();
            
            // Refresh the upgrade menu to show new state
            this.refreshUpgradeMenu();
            
            // Show upgrade effect
            this.showUpgradeEffect(abilityName);
        }
    }
    
    refreshUpgradeMenu() {
        // Remove only the upgrade cards, keep the background and headers
        const elementsToKeep = 6; // background, title, tokens earned, current tokens, 2 headers
        while (this.upgradeMenuElements.length > elementsToKeep) {
            const element = this.upgradeMenuElements.pop();
            if (element && element.destroy) {
                element.destroy();
            }
        }
        
        // Recreate the cards
        this.createUpgradeCards();
        
        // Recreate continue button and ESC instruction
        this.createContinueButton();
        
        // Update current tokens display
        this.upgradeMenuElements[3].setText(`Tokens: ${this.player.tokens}  Special: ${this.player.specialTokens}`);
    }
    
    createContinueButton() {
        // Add Continue button
        let continueButton = this.add.rectangle(600, 680, 200, 50, 0x00aa00, 1);
        continueButton.setStrokeStyle(3, 0x00ff00);
        continueButton.setInteractive();
        
        let continueButtonText = this.add.text(600, 680, 'CONTINUE', {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Add ESC to continue instruction
        let continueText = this.add.text(600, 720, 'Press ESC to continue without upgrading', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#cccccc'
        }).setOrigin(0.5);
        
        this.upgradeMenuElements.push(continueButton, continueButtonText, continueText);
        
        // Continue button interactions
        continueButton.on('pointerover', () => {
            continueButton.setFillStyle(0x00cc00);
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setFillStyle(0x00aa00);
        });
        
        continueButton.on('pointerdown', () => {
            this.closeUpgradeMenu();
        });
    }
    
    showUpgradeEffect(abilityName) {
        let upgradeDisplayName;
        
        if (abilityName === 'jump') {
            // Get the actual jump upgrade name based on the new rank
            const jumpRank = this.player.abilityRanks.jump;
            if (jumpRank === 1) upgradeDisplayName = 'Double Jump';
            else if (jumpRank === 2) upgradeDisplayName = 'Triple Jump';
            else if (jumpRank === 3) upgradeDisplayName = 'Quad Jump';
            else upgradeDisplayName = 'Jump';
        } else if (abilityName === 'speed') {
            // Get the actual speed upgrade name based on the new rank
            const speedRank = this.player.abilityRanks.speed;
            if (speedRank === 1) upgradeDisplayName = 'Super Speed I';
            else if (speedRank === 2) upgradeDisplayName = 'Super Speed II';
            else if (speedRank === 3) upgradeDisplayName = 'Super Speed III';
            else upgradeDisplayName = 'Super Speed';
        } else if (abilityName === 'slowBombs') {
            // Get the actual slow bombs upgrade name based on the new rank
            const slowBombsRank = this.player.abilityRanks.slowBombs;
            const tierNames = ['Slow Bombs I', 'Slow Bombs II', 'Slow Bombs III', 'Slow Bombs IV'];
            upgradeDisplayName = tierNames[slowBombsRank - 1] || 'Slow Bombs';
        } else if (abilityName === 'starMagnet') {
            // Get the actual star magnet upgrade name based on the new rank
            const starMagnetRank = this.player.abilityRanks.starMagnet;
            const tierNames = ['Star Magnet I', 'Star Magnet II', 'Star Magnet III', 'Star Magnet IV'];
            upgradeDisplayName = tierNames[starMagnetRank - 1] || 'Star Magnet';
        } else {
            const abilityNames = {
                'fastFall': 'Fast Fall',
                'barrier': 'Barrier',
                'timeFreeze': 'Time Freeze',
                'emp': 'EMP'
            };
            upgradeDisplayName = abilityNames[abilityName];
        }
        
        let effectText = this.add.text(600, 600, `${upgradeDisplayName} UPGRADED!`, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.upgradeMenuElements.push(effectText);
        
        // Fade out after 1 second
        this.time.delayedCall(1000, () => {
            if (effectText) {
                this.tweens.add({
                    targets: effectText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (effectText && effectText.destroy) {
                            effectText.destroy();
                        }
                    }
                });
            }
        });
    }
    
    closeUpgradeMenu() {
        // Clean up all upgrade menu elements
        if (this.upgradeMenuElements) {
            this.upgradeMenuElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.upgradeMenuElements = [];
        }
        
        // Remove ESC key listener
        if (this.escKey) {
            this.escKey.removeAllListeners();
            this.input.keyboard.removeKey(this.escKey);
            this.escKey = null;
        }
        
        // Continue to level
        this.continueLevelAfterUpgrade();
    }
    
    continueLevelAfterUpgrade() {
        // Show "Get Ready!" countdown
        let getReadyText = this.add.text(600, 400, 'GET READY!', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
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
                this.cursors.timeFreeze.isDown = false;
                
                // Reset key states
                this.barrierKeyPressed = false;
                this.jumpKeyPressed = false;
                this.timeFreezeKeyPressed = false;
                
                // Increase number of stars based on level for more challenge
                let numStars = Math.min(12 + Math.floor(this.currentLevel / 2), 20); // Max 20 stars
                
                // Respawn stars for the new level
                for (let i = 0; i < numStars; i++) {
                    this.createFlyingStar();
                }

                this.releasedBomb();
            }
        });
    }

}