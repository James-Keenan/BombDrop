import { Player } from '../Games Objects/player.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

    }

    create() {
        // Scale background to fit the new screen size (1450x950)
        let bg = this.add.image(725, 475, 'sky');
        bg.setScale(1450 / bg.width, 950 / bg.height);

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(900, 950, "ground").setScale(5.2).refreshBody();

        
        // Create horizontally moving platform separately as kinematic body
        this.movingPlatform = this.physics.add.sprite(408, 399, 'ground').setScale(.4, 0.3);
        this.movingPlatform.body.setImmovable(true);
        this.movingPlatform.body.setGravityY(0); // Disable gravity so it doesn't fall
        this.movingPlatform.setVelocityX(80); // Initial horizontal velocity (moving right)
        this.movingPlatform.moveDirection = 1; // 1 for right, -1 for left
        this.movingPlatform.minX = 300; // Left boundary
        this.movingPlatform.maxX = 700; // Right boundary
        this.movingPlatform.originalX = 408; // Remember original position
        this.platforms.create(1110, 185, 'ground').setScale(1.2, 0.3).refreshBody();
        this.platforms.create(-50, 150, 'ground').setScale(1, 0.3).refreshBody(); //top left
        this.platforms.create(700, 600, 'ground').setScale(1, 0.3).refreshBody();
        this.platforms.create(181, 825, 'ground').setScale(1, 5.3).refreshBody();

        // Get selected character from registry, default to 'dude' if none selected
        const selectedCharacter = this.registry.get('selectedCharacter') || 'dude';
        this.player = new Player(this, 100, 523, selectedCharacter);

        // Set up platform collision with custom process function for platform drop
        this.physics.add.collider(this.player, this.platforms, null, this.platformCollisionProcess, this);
        this.physics.add.collider(this.player, this.movingPlatform, null, this.platformCollisionProcess, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Add SPACE key for jumping
        this.cursors.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Add W key for barrier activation
        this.cursors.barrier = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        
        // Add E key for EMP activation
        this.cursors.emp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Add Q key for Sonic Boom activation
        this.cursors.sonicBoom = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // Create stars with random positions and movement
        this.createMovingStars();

        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // Clear old version data - version 3.0 introduces major gameplay changes
        this.clearOldVersionData();
        
        this.highScore = localStorage.getItem('highScore') || 0;
        // Reset score to 0 when starting a new game
        this.score = 0;

        // Level system
        this.currentLevel = 1;
        this.highestLevel = localStorage.getItem('highestLevel') || 1;
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
        this.livesText = this.add.text(725, 16, 'Lives: ' + this.lives, { fontSize: '32px', fill: '#ff0000'}).setOrigin(0.5, 0);
        this.levelText = this.add.text(1434, 16, 'Level: ' + this.currentLevel, { fontsize: '32px', fill: '#00ff00'}).setOrigin(1, 0);
        
        // Track barrier and EMP key states
        this.barrierKeyPressed = false;
        this.empKeyPressed = false;
        this.sonicBoomKeyPressed = false;

        this.bombs = this.physics.add.group();

        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.bombs, this.movingPlatform);
        this.playerBombCollider = this.physics.add.collider(this.player,this.bombs, this.hitBomb, null, this);

        // Track jump key state to prevent continuous jumping
        this.jumpKeyPressed = false;

        // Track invincibility state to prevent multiple hits
        this.playerInvincible = false;
        
        // Track barrier key state to prevent continuous activation
        this.barrierKeyPressed = false;
        
        // Create barrier UI elements (initially hidden)
        this.createBarrierUI();
        
        // Create EMP UI elements (initially hidden)
        this.createEMPUI();
        
        // Create Sonic Boom UI elements (initially hidden)
        this.createSonicBoomUI();
        
        // Create Life Regen UI elements (initially hidden)
        this.createLifeRegenUI();

        // Release the first bomb immediately when the game starts
        this.releasedBomb();

    }

    update(time) {
        // Update player jump tracking
        this.player.update();
        
        // Update horizontally moving platform
        if (this.movingPlatform) {
            // Ensure platform stays at fixed Y position (no vertical movement)
            this.movingPlatform.setVelocityY(0);
            this.movingPlatform.y = 399; // Force Y position to stay fixed
            
            // Check boundaries and reverse direction if needed
            if (this.movingPlatform.x <= this.movingPlatform.minX) {
                this.movingPlatform.moveDirection = 1; // Move right
                this.movingPlatform.setVelocityX(80);
            } else if (this.movingPlatform.x >= this.movingPlatform.maxX) {
                this.movingPlatform.moveDirection = -1; // Move left
                this.movingPlatform.setVelocityX(-80);
            }
        }
        
        if (this.cursors.left.isDown){
            this.player.moveLeft();
        }
        else if (this.cursors.right.isDown){
            this.player.moveRight();
        }
        else{
            this.player.idle();
        }

        // Handle jump input - only jump on key press, not while held (UP arrow or SPACE)
        if ((this.cursors.up.isDown || this.cursors.space.isDown) && !this.jumpKeyPressed) {
            this.player.jump();
            this.jumpKeyPressed = true;
        } else if (!this.cursors.up.isDown && !this.cursors.space.isDown) {
            this.jumpKeyPressed = false;
        }

        // Handle fast fall when down key is pressed
        if (this.cursors.down.isDown) {
            this.player.fastFall();
        }
        
        // Handle barrier activation with W key (only when unlocked)
        if (this.cursors.barrier.isDown && !this.barrierKeyPressed) {
            if (this.player.activateBarrier()) {
                this.barrierKeyPressed = true;
            }
        } else if (!this.cursors.barrier.isDown) {
            this.barrierKeyPressed = false;
        }
        
        // Handle EMP activation with E key (only when unlocked and available)
        if (this.cursors.emp.isDown && !this.empKeyPressed) {
            if (this.player.activateEMP(this.bombs)) {
                this.empKeyPressed = true;
            }
        } else if (!this.cursors.emp.isDown) {
            this.empKeyPressed = false;
        }
        
        // Handle Sonic Boom activation with Q key (only when unlocked and available)
        if (this.cursors.sonicBoom.isDown && !this.sonicBoomKeyPressed) {
            if (this.player.activateSonicBoom(this.bombs)) {
                this.sonicBoomKeyPressed = true;
            }
        } else if (!this.cursors.sonicBoom.isDown) {
            this.sonicBoomKeyPressed = false;
        }
        
        // Throttle UI updates to prevent performance issues
        // Only update UI every 10 frames (6 times per second instead of 60)
        if (!this.uiUpdateCounter) {
            this.uiUpdateCounter = 0;
        }
        this.uiUpdateCounter++;
        
        if (this.uiUpdateCounter >= 10) {
            // Update barrier UI
            this.updateBarrierUI();
            
            // Update EMP UI
            this.updateEMPUI();
            
            // Update Sonic Boom UI
            this.updateSonicBoomUI();
            
            // Update Life Regen UI
            this.updateLifeRegenUI();
            
            this.uiUpdateCounter = 0;
        }
        
        // Apply star magnet effect (this needs to be called every frame for smooth movement)
        this.player.applyStarMagnet(this.stars);

    }

    collectStar (player, star){
        star.disableBody(true, true);

        // Apply star score value upgrade
        const scoreEarned = this.player.getStarScoreValue();
        this.score += scoreEarned;
        this.scoreText.setText('score: ' + this.score);
        

        
        // Track star collection for EMP charging (pass the actual points earned)
        this.player.collectStar(scoreEarned);
        
        // Track star collection for Sonic Boom charging
        this.player.chargeSonicBoom(scoreEarned);

        // Automatic life system removed - now handled by Life Regen ability

        // Check for level progression - removed score-based leveling
        // Now levels only increase when all stars are collected!

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.highScoreText.setText('high score: ' + this.highScore);
        }

        if (this.stars.countActive(true) === 0){
            // Level up when all stars are collected!
            console.log('Level up triggered, current level:', this.currentLevel);
            this.currentLevel++;
            this.levelText.setText('Level: ' + this.currentLevel);
            console.log('New level:', this.currentLevel);
            
            // Update highest level if necessary
            if (this.currentLevel > this.highestLevel) {
                this.highestLevel = this.currentLevel;
                localStorage.setItem('highestLevel', this.highestLevel);
            }
            
            // Award tokens for completing the level
            const baseTokens = this.currentLevel <= 2 ? 1 : 2; // 1 token for levels 1-2, then 2 tokens
            const bonusTokens = this.player.getBonusTokensPerLevel(); // Bonus tokens from upgrade
            const tokensEarned = baseTokens + bonusTokens;
            console.log('Tokens earned:', tokensEarned, '(base:', baseTokens, '+ bonus:', bonusTokens, ')');
            this.player.earnTokens(tokensEarned);
            this.updateTokenUI();
            
            // Award special token every 5 levels
            if (this.currentLevel % 5 === 0) {
                console.log('Special token earned at level:', this.currentLevel);
                this.player.earnSpecialToken();
                this.updateTokenUI();
                
                // Show special token notification
                this.showSpecialTokenNotification();
            }
            
            // Pause the game for level-up notifications
            this.physics.pause();
            this.input.keyboard.enabled = false;
            
            // Apply level changes first
            console.log('Applying level changes for level:', this.currentLevel);
            this.applyLevelChanges();
            
            // Show upgrade menu instead of old ability choice
            console.log('Showing upgrade menu for level:', this.currentLevel);
            this.showUpgradeMenu();
        }

    }

hitBomb (player, bomb){
    // Check if barrier is active - player is invincible
    if (player.isInvincible()) {
        // Barrier is active, make bomb bounce off the player instead of being destroyed
        
        // Calculate bounce direction based on bomb and player positions
        const bounceForceX = bomb.x < player.x ? -300 : 300; // Bounce away from player
        const bounceForceY = -200; // Always bounce upward
        
        // Apply the bounce force
        bomb.setVelocity(bounceForceX, bounceForceY);
        
        // Ensure bomb maintains its bouncy properties
        bomb.setBounce(1);
        bomb.setDrag(0);
        bomb.setFriction(0);
        
        return;
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

        // Store the final score and level in the registry so GameOver scene can access it
        this.registry.set('finalScore', this.score);
        this.registry.set('finalLevel', this.currentLevel);
        
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
        
        // Flash effect for 2 seconds of invincibility
        this.tweens.add({
            targets: player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 19, // 2 seconds total (100ms * 2 * 10 cycles = 2000ms)
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
        let lifeLostText = this.add.text(725, 333, 'LIFE LOST! Lives: ' + this.lives, {
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
        let x = (this.player.x < 725) ? Phaser.Math.Between(725, 1450) : Phaser.Math.Between(0, 725);

        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        
        // Ensure bomb maintains consistent bounce and doesn't lose velocity
        bomb.body.bounce.setTo(1, 1);
        bomb.body.friction.setTo(0, 0);
        bomb.body.drag.setTo(0, 0);
        
        // Fixed bomb speed - no level scaling
        const baseSpeed = 200;
        
        // Apply slow bombs stat (permanent effect)
        const slowFactor = this.player.getBombSlowFactor();
        const finalBombSpeed = baseSpeed * slowFactor;
        
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
        this.physics.add.collider(this.stars, this.movingPlatform);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    }

    createFlyingStar() {
        // Define safe spawn areas to avoid platforms and ensure proper spacing
        let x, y;
        let attempts = 0;
        let maxAttempts = 30;
        const minDistanceFromOtherStars = 240; // Minimum distance between stars
        
        do {
            x = Phaser.Math.Between(80, 1370); // Slightly more inset from edges
            y = Phaser.Math.Between(60, 340); // Keep stars in upper area to avoid most platforms
            attempts++;
            
            let validPosition = true;
            
            // Check if position conflicts with known platform positions
            // Check against moving platform area (it moves between x=300-516, y=399)
            if (x >= 260 && x <= 556 && Math.abs(y - 399) < 80) validPosition = false;
            // Check against platform at (1110, 185)
            if (Math.abs(x - 1110) < 170 && Math.abs(y - 185) < 70) validPosition = false;
            // Check against platform at (-50, 150)
            if (Math.abs(x - (-50)) < 120 && Math.abs(y - 150) < 70) validPosition = false;
            // Check against platform at (700, 600) - less relevant since we spawn high
            if (Math.abs(x - 700) < 120 && Math.abs(y - 600) < 70) validPosition = false;
            // Check against platform at (181, 825) - less relevant since we spawn high
            if (Math.abs(x - 181) < 120 && Math.abs(y - 825) < 170) validPosition = false;
            
            // Check distance from existing stars to ensure spacing
            if (validPosition && this.stars) {
                this.stars.children.entries.forEach(existingStar => {
                    if (existingStar.active) {
                        const distance = Phaser.Math.Distance.Between(x, y, existingStar.x, existingStar.y);
                        if (distance < minDistanceFromOtherStars) {
                            validPosition = false;
                        }
                    }
                });
            }
            
            if (validPosition) break;
            
        } while (attempts < maxAttempts);
        
        let star = this.stars.create(x, y, 'star');
        
        // Simple consistent star behavior - stationary and affected by gravity
        star.setBounceY(0.7);
        star.setBounceX(0.2);
        star.setCollideWorldBounds(true);
        // Normal size and opacity
        star.setScale(1.0);
        star.setAlpha(1.0);
    }

    applyLevelChanges() {
        // Change background asset color based on level (every 5 levels)
        const colors = [
            0xffffff,
            0xffd700,
            0xff1493,
            0xdc143c,
            0x9370DB,
            0xB03060,
            0xdc143c, 
            0x000080  
        ];
        
        // Calculate color index based on groups of 5 levels
        const colorIndex = Math.min(Math.floor((this.currentLevel - 1) / 5), colors.length - 1);
        
        // Find the background image and change its tint
        this.children.list.forEach(child => {
            if (child.texture && child.texture.key === 'sky') {
                child.setTint(colors[colorIndex]);
            }
        });
    }

    createBarrierUI() {
        // Barrier UI - positioned at the bottom left
        this.barrierLabel = this.add.text(16, 870, 'Barrier:', { fontSize: '20px', fill: '#00ffff'});
        
        // Barrier charge bar background
        this.barrierBarBg = this.add.rectangle(16, 900, 200, 20, 0x333333);
        this.barrierBarBg.setOrigin(0, 0.5);
        this.barrierBarBg.setStrokeStyle(2, 0x00ffff);
        
        // Barrier charge bar fill
        this.barrierBarFill = this.add.rectangle(18, 900, 196, 16, 0x00ffff);
        this.barrierBarFill.setOrigin(0, 0.5);
        
        // Barrier instruction text
        this.barrierInstruction = this.add.text(16, 920, 'Press W to activate', { fontSize: '14px', fill: '#ffffff'});
        
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
            this.barrierInstruction.setText('Press W to activate');
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
    
    // Create EMP UI
    createEMPUI() {
        // EMP UI - positioned at the bottom right
        this.empLabel = this.add.text(1434, 870, 'EMP:', { fontSize: '20px', fill: '#ffff00'}).setOrigin(1, 0);
        
        // EMP charge bar background
        this.empBarBg = this.add.rectangle(1434, 900, 200, 20, 0x333333);
        this.empBarBg.setOrigin(1, 0.5);
        this.empBarBg.setStrokeStyle(2, 0xffff00);
        
        // EMP charge bar fill
        this.empBarFill = this.add.rectangle(1432, 900, 196, 16, 0xffff00);
        this.empBarFill.setOrigin(1, 0.5);
        
        // EMP instruction text
        this.empInstructionText = this.add.text(1434, 920, 'Press E to activate', { fontSize: '16px', fill: '#cccccc'}).setOrigin(1, 0);
        
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
            
            // Update charge bar based on star points collected
            const chargePercentage = Math.min(this.player.starPointsCollected / this.player.starPointsNeededForEMP, 1);
            this.empBarFill.scaleX = chargePercentage;
            
            // Update text based on availability and tier
            const empTier = this.player.abilityRanks.emp;
            let delayText = '';
            if (empTier >= 3) delayText = ' (4s delay)';
            else if (empTier >= 2) delayText = ' (6s delay)';
            else delayText = ' (8s delay)';
            
            if (this.player.empActive) {
                this.empLabel.setText(`EMP: ACTIVE${delayText}`);
                this.empLabel.setTint(0xff00ff);
                this.empBarFill.setFillStyle(0xff00ff);
                this.empInstructionText.setText('Bombs will return soon...');
            } else if (this.player.empAvailable) {
                this.empLabel.setText(`EMP: READY${delayText}`);
                this.empLabel.setTint(0x00ff00);
                this.empBarFill.setFillStyle(0x00ff00);
                this.empInstructionText.setText('Press E to destroy all bombs');
            } else {
                this.empLabel.setText(`EMP: ${this.player.starPointsCollected}/${this.player.starPointsNeededForEMP}${delayText}`);
                this.empLabel.setTint(0xffff00);
                this.empBarFill.setFillStyle(0xffff00);
                this.empInstructionText.setText('Collect star points to charge');
            }
        } else {
            // Hide EMP UI elements when not unlocked
            this.empLabel.setVisible(false);
            this.empBarBg.setVisible(false);
            this.empBarFill.setVisible(false);
            this.empInstructionText.setVisible(false);
        }
    }

    // Create Sonic Boom UI
    createSonicBoomUI() {
        // Sonic Boom UI - positioned at the center bottom (raised for better visibility)
        this.sonicBoomLabel = this.add.text(725, 840, 'Sonic Boom:', { fontSize: '20px', fill: '#ff6600'}).setOrigin(0.5, 0);
        
        // Sonic Boom charge bar background
        this.sonicBoomBarBg = this.add.rectangle(725, 870, 200, 20, 0x333333);
        this.sonicBoomBarBg.setOrigin(0.5, 0.5);
        this.sonicBoomBarBg.setStrokeStyle(2, 0xff6600);
        
        // Sonic Boom charge bar fill
        this.sonicBoomBarFill = this.add.rectangle(725, 870, 196, 16, 0xff6600);
        this.sonicBoomBarFill.setOrigin(0.5, 0.5);
        
        // Sonic Boom charges display
        this.sonicBoomCharges = this.add.text(725, 890, 'Charges: 0', { fontSize: '16px', fill: '#ffaa00'}).setOrigin(0.5, 0);
        
        // Sonic Boom instruction text
        this.sonicBoomInstructionText = this.add.text(725, 910, 'Press Q to throw pulse grenade', { fontSize: '14px', fill: '#cccccc'}).setOrigin(0.5, 0);
        
        // Hide UI initially (will be shown when unlocked)
        this.sonicBoomLabel.setVisible(false);
        this.sonicBoomBarBg.setVisible(false);
        this.sonicBoomBarFill.setVisible(false);
        this.sonicBoomCharges.setVisible(false);
        this.sonicBoomInstructionText.setVisible(false);
    }
    
    // Update Sonic Boom UI
    updateSonicBoomUI() {
        if (this.player.sonicBoomUnlocked) {
            // Show Sonic Boom UI elements
            this.sonicBoomLabel.setVisible(true);
            this.sonicBoomBarBg.setVisible(true);
            this.sonicBoomBarFill.setVisible(true);
            this.sonicBoomCharges.setVisible(true);
            this.sonicBoomInstructionText.setVisible(true);
            
            // Update charge bar based on points collected
            const chargeProgress = this.player.sonicBoomPointsCollected;
            const chargeNeeded = this.player.sonicBoomPointsNeededForCharge;
            const chargePercentage = Math.min(chargeProgress / chargeNeeded, 1);
            this.sonicBoomBarFill.scaleX = chargePercentage;
            
            // Update charges display
            const charges = this.player.getSonicBoomCharges();
            const tier = this.player.abilityRanks.sonicBoom;
            let bombsText = '';
            if (tier === 1) bombsText = ' (1 bomb)';
            else if (tier === 2) bombsText = ' (2 bombs)';
            else if (tier === 3) bombsText = ' (3 bombs)';
            
            this.sonicBoomCharges.setText(`Charges: ${charges}${bombsText}`);
            
            // Update text and colors based on availability
            if (charges > 0) {
                this.sonicBoomLabel.setText('Sonic Boom: READY');
                this.sonicBoomLabel.setTint(0x00ff00);
                this.sonicBoomBarFill.setFillStyle(0x00ff00); // Green when ready
                this.sonicBoomInstructionText.setText('Press Q to throw pulse grenade');
            } else {
                this.sonicBoomLabel.setText(`Sonic Boom: ${chargeProgress}/${chargeNeeded}`);
                this.sonicBoomLabel.setTint(0xff6600);
                this.sonicBoomBarFill.setFillStyle(0xff6600); // Orange when charging
                this.sonicBoomInstructionText.setText(`Collect ${chargeNeeded - chargeProgress} more points for charge`);
            }
        } else {
            // Hide Sonic Boom UI elements when not unlocked
            this.sonicBoomLabel.setVisible(false);
            this.sonicBoomBarBg.setVisible(false);
            this.sonicBoomBarFill.setVisible(false);
            this.sonicBoomCharges.setVisible(false);
            this.sonicBoomInstructionText.setVisible(false);
        }
    }

    showSpecialTokenNotification() {
        let specialTokenText = this.add.text(600, 300, 'SPECIAL TOKEN EARNED!', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Fade out after 2 seconds
        this.time.delayedCall(2000, () => {
            if (specialTokenText) {
                this.tweens.add({
                    targets: specialTokenText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (specialTokenText && specialTokenText.destroy) {
                            specialTokenText.destroy();
                        }
                    }
                });
            }
        });
    }

    showUpgradeMenu() {
        console.log('showUpgradeMenu called for level:', this.currentLevel);
        console.log('Player tokens:', this.player.tokens, 'Special tokens:', this.player.specialTokens);
        
        // Create upgrade menu background - full screen
        let menuBackground = this.add.rectangle(725, 475, 1450, 950, 0x000000, 0.9);
        
        // Title with level info
        let title = this.add.text(725, 80, `LEVEL ${this.currentLevel} COMPLETE!`, {
            fontFamily: 'Arial Black',
            fontSize: 42,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Tokens earned notification
        const baseTokens = this.currentLevel <= 2 ? 1 : 2;
        const bonusTokens = this.player.getBonusTokensPerLevel();
        const tokensEarned = baseTokens + bonusTokens;
        let tokensEarnedText = this.add.text(725, 130, `+${tokensEarned} Token${tokensEarned > 1 ? 's' : ''} Earned!${bonusTokens > 0 ? ` (${baseTokens}+${bonusTokens} bonus)` : ''}`, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Current tokens display
        let currentTokensText = this.add.text(725, 180, `Tokens: ${this.player.tokens}  Special: ${this.player.specialTokens}`, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Section headers
        let regularHeader = this.add.text(450, 250, 'REGULAR UPGRADES', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        let premiumHeader = this.add.text(1000, 250, '★ PREMIUM UPGRADES ★', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Store UI elements for cleanup
        this.upgradeMenuElements = [menuBackground, title, tokensEarnedText, currentTokensText, regularHeader, premiumHeader];
        
        console.log('About to create upgrade cards...');
        // Create upgrade cards
        this.createUpgradeCards();
        
        console.log('About to create continue button...');
        // Create continue button and ESC instruction
        this.createContinueButton();
        
        // Add ESC key listener
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => {
            this.closeUpgradeMenu();
        });
        
        console.log('showUpgradeMenu completed successfully');
    }
    
    createUpgradeCards() {
        console.log('createUpgradeCards called');
        
        const regularUpgrades = [
            { name: 'jump', title: this.player.getJumpUpgradeName(), icon: '⬆', x: 200, y: 350 },
            { name: 'speed', title: this.player.getSpeedUpgradeName(), icon: '»', x: 350, y: 350 },
            { name: 'fastFall', title: 'Fast Fall', icon: '⬇', x: 500, y: 350 },
            { name: 'slowBombs', title: this.player.getSlowBombsUpgradeName(), icon: '🐌', x: 200, y: 500 },
            { name: 'starMultiplier', title: this.player.getStarMultiplierUpgradeName(), icon: '⭐', x: 200, y: 650 },
            { name: 'starMagnet', title: this.player.getStarMagnetUpgradeName(), icon: '🧲', x: 350, y: 500 },
            { name: 'lifeRegen', title: this.player.getLifeRegenUpgradeName(), icon: '♥', x: 500, y: 500 },
            { name: 'extraLife', title: this.player.getExtraLifeUpgradeName(), icon: '💖', x: 350, y: 650 }
        ];
        
        console.log('Regular upgrades defined:', regularUpgrades);
        
        const premiumUpgrades = [
            { name: 'barrier', title: this.player.getBarrierUpgradeName(), icon: '⦿', x: 850, y: 350 },
            { name: 'emp', title: 'EMP', icon: '⚡', x: 1000, y: 350 },
            { name: 'sonicBoom', title: this.player.getSonicBoomUpgradeName(), icon: '💥', x: 1150, y: 350 },
            { name: 'platformDrop', title: this.player.getPlatformDropUpgradeName(), icon: '↕', x: 850, y: 500 },
            { name: 'tokenBonus', title: this.player.getTokenBonusUpgradeName(), icon: '�', x: 1000, y: 500 }
        ];
        
        console.log('Premium upgrades defined:', premiumUpgrades);
        
        // Create regular upgrade cards
        console.log('Creating regular upgrade cards...');
        regularUpgrades.forEach((upgrade, index) => {
            console.log(`Creating regular card ${index}:`, upgrade.name, upgrade.title);
            this.createUpgradeCard(upgrade, false);
        });
        
        // Create premium upgrade cards
        console.log('Creating premium upgrade cards...');
        premiumUpgrades.forEach((upgrade, index) => {
            console.log(`Creating premium card ${index}:`, upgrade.name, upgrade.title);
            this.createUpgradeCard(upgrade, true);
        });
        
        console.log('createUpgradeCards completed successfully');
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
        
        // Make card interactive for all cards (for tooltips)
        card.setInteractive();
        
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
        
        // Rank display (hide for extraLife)
        let rankText = '';
        let rank = null;
        
        if (upgrade.name !== 'extraLife') {
            rankText = `${currentRank}/${maxRank}`;
            if (currentRank >= maxRank) rankText = 'MAX';
            
            rank = this.add.text(upgrade.x, upgrade.y + 15, rankText, {
                fontFamily: 'Arial Black',
                fontSize: 10,
                color: currentRank >= maxRank ? '#00ff00' : '#ffffff'
            }).setOrigin(0.5);
        }
        
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
        let elementsToStore = [card, icon, title, costDisplay];
        if (rank) elementsToStore.push(rank);
        this.upgradeMenuElements.push(...elementsToStore);
        
        // Add tooltip functionality for all cards (upgradeable or not)
        const abilityInfo = this.getAbilityDescription(upgrade.name, currentRank);
        
        card.on('pointerover', () => {
            if (canUpgrade) {
                card.setFillStyle(0x0066aa);
            }
            // Show tooltip
            this.createTooltip(upgrade.x + 60, upgrade.y - 60, abilityInfo.title, abilityInfo.desc);
        });
        
        card.on('pointerout', () => {
            if (canUpgrade) {
                card.setFillStyle(0x004488);
            }
            // Hide tooltip
            this.hideTooltip();
        });
        
        // Button interactions
        if (canUpgrade) {
            card.on('pointerdown', () => {
                this.purchaseUpgrade(upgrade.name);
            });
        }
    }
    
    purchaseUpgrade(abilityName) {
        // Check if this is the first purchase of Life Regen
        const wasLifeRegenLocked = (abilityName === 'lifeRegen' && this.player.abilityRanks.lifeRegen === 0);
        
        if (this.player.upgradeAbility(abilityName)) {
            // Grant an extra life when first purchasing Life Regen
            if (wasLifeRegenLocked) {
                this.lives++;
                this.livesText.setText('Lives: ' + this.lives);
                
                // Show special notification for Life Regen unlock + bonus life
                const bonusLifeText = this.add.text(this.cameras.main.centerX, 150, 'LIFE REGEN UNLOCKED!\n+1 BONUS LIFE!', {
                    fontFamily: 'Arial Black',
                    fontSize: 24,
                    color: '#00ff88',
                    stroke: '#000000',
                    strokeThickness: 3,
                    align: 'center'
                }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: bonusLifeText,
                    alpha: 0,
                    duration: 3000,
                    ease: 'Power2',
                    onComplete: () => {
                        bonusLifeText.destroy();
                    }
                });
            }
            
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
        // Add Continue button - centered at bottom
        let continueButton = this.add.rectangle(725, 780, 250, 60, 0x00aa00, 1);
        continueButton.setStrokeStyle(3, 0x00ff00);
        continueButton.setInteractive();
        
        let continueButtonText = this.add.text(725, 780, 'CONTINUE', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Add ESC to continue instruction
        let continueText = this.add.text(725, 850, 'Press ESC to continue without upgrading', {
            fontFamily: 'Arial',
            fontSize: 20,
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
            else if (jumpRank === 4) upgradeDisplayName = 'Penta Jump';
            else if (jumpRank === 5) upgradeDisplayName = 'Hexa Jump';
            else upgradeDisplayName = 'Jump';
        } else if (abilityName === 'speed') {
            // Get the actual speed upgrade name based on the new rank
            const speedRank = this.player.abilityRanks.speed;
            if (speedRank === 1) upgradeDisplayName = 'Super Speed I';
            else if (speedRank === 2) upgradeDisplayName = 'Super Speed II';
            else if (speedRank === 3) upgradeDisplayName = 'Super Speed III';
            else if (speedRank === 4) upgradeDisplayName = 'Super Speed IV';
            else if (speedRank === 5) upgradeDisplayName = 'Super Speed V';
            else upgradeDisplayName = 'Super Speed';
        } else if (abilityName === 'slowBombs') {
            // Get the actual slow bombs upgrade name based on the new rank
            const slowBombsRank = this.player.abilityRanks.slowBombs;
            const tierNames = ['Slow Bombs I', 'Slow Bombs II', 'Slow Bombs III', 'Slow Bombs IV', 'Slow Bombs V'];
            upgradeDisplayName = tierNames[slowBombsRank - 1] || 'Slow Bombs';
        } else if (abilityName === 'starMagnet') {
            // Get the actual star magnet upgrade name based on the new rank
            const starMagnetRank = this.player.abilityRanks.starMagnet;
            const tierNames = ['Star Magnet I', 'Star Magnet II', 'Star Magnet III', 'Star Magnet IV', 'Star Magnet V'];
            upgradeDisplayName = tierNames[starMagnetRank - 1] || 'Star Magnet';
        } else if (abilityName === 'starMultiplier') {
            // Get the actual star multiplier upgrade name based on the new rank
            const starMultiplierRank = this.player.abilityRanks.starMultiplier;
            if (starMultiplierRank === 1) upgradeDisplayName = 'Star Multiplier x1.1';
            else if (starMultiplierRank === 2) upgradeDisplayName = 'Star Multiplier x1.3';
            else if (starMultiplierRank === 3) upgradeDisplayName = 'Star Multiplier x1.5';
            else upgradeDisplayName = 'Star Multiplier';
        } else if (abilityName === 'platformDrop') {
            // Get the actual platform drop upgrade name based on the new rank
            const platformDropRank = this.player.abilityRanks.platformDrop;
            if (platformDropRank === 1) upgradeDisplayName = 'Platform Jump';
            else if (platformDropRank === 2) upgradeDisplayName = 'Platform Drop';
            else if (platformDropRank === 3) upgradeDisplayName = 'Platform Drop All';
            else upgradeDisplayName = 'Platform Drop';
        } else if (abilityName === 'tokenBonus') {
            // Get the actual token bonus upgrade name based on the new rank
            const tokenBonusRank = this.player.abilityRanks.tokenBonus;
            if (tokenBonusRank === 1) upgradeDisplayName = 'Token Bonus +2';
            else if (tokenBonusRank === 2) upgradeDisplayName = 'Token Bonus +3';
            else if (tokenBonusRank === 3) upgradeDisplayName = 'Token Bonus +4';
            else upgradeDisplayName = 'Token Bonus';
        } else {
            const abilityNames = {
                'fastFall': `Fast Fall ${this.player.abilityRanks.fastFall > 0 ? 'Tier ' + this.player.abilityRanks.fastFall : ''}`,
                'barrier': 'Barrier',
                'emp': 'EMP',
                'extraLife': 'Extra Life'
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
        // Hide any active tooltip
        this.hideTooltip();
        
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
                this.cursors.barrier.isDown = false;
                
                // Reset key states
                this.barrierKeyPressed = false;
                this.jumpKeyPressed = false;
                this.sonicBoomKeyPressed = false;
                
                // Always spawn the same number of stars (12) for consistency
                const numStars = 12;
                
                // Respawn stars for the new level
                for (let i = 0; i < numStars; i++) {
                    this.createFlyingStar();
                }

                this.releasedBomb();
            }
        });
    }

    // Tooltip system for upgrade descriptions
    createTooltip(x, y, title, description) {
        // Hide any existing tooltip first
        this.hideTooltip();
        
        // Create tooltip background
        const tooltipWidth = 320;
        const tooltipHeight = 120;
        
        // Adjust position to keep tooltip on screen
        let adjustedX = x;
        let adjustedY = y - tooltipHeight - 10;
        
        // Keep tooltip within screen bounds
        if (adjustedX + tooltipWidth > 1450) {
            adjustedX = 1450 - tooltipWidth - 10;
        }
        if (adjustedX < 10) {
            adjustedX = 10;
        }
        if (adjustedY < 10) {
            adjustedY = y + 70; // Show below if no room above
        }
        
        this.tooltip = this.add.rectangle(adjustedX + tooltipWidth/2, adjustedY + tooltipHeight/2, tooltipWidth, tooltipHeight, 0x000000, 0.95);
        this.tooltip.setStrokeStyle(3, 0xffffff);
        this.tooltip.setDepth(1000); // Ensure tooltip appears above everything
        
        // Title text
        this.tooltipTitle = this.add.text(adjustedX + 15, adjustedY + 15, title, {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffff00',
            wordWrap: { width: tooltipWidth - 30 }
        });
        this.tooltipTitle.setDepth(1001);
        
        // Description text
        this.tooltipDescription = this.add.text(adjustedX + 15, adjustedY + 40, description, {
            fontFamily: 'Arial',
            fontSize: 13,
            color: '#ffffff',
            wordWrap: { width: tooltipWidth - 30 }
        });
        this.tooltipDescription.setDepth(1001);
        
        // Store tooltip elements for cleanup
        this.tooltipElements = [this.tooltip, this.tooltipTitle, this.tooltipDescription];
    }
    
    hideTooltip() {
        if (this.tooltipElements) {
            this.tooltipElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.tooltipElements = null;
        }
    }
    
    getAbilityDescription(abilityName, currentRank) {
        const descriptions = {
            jump: {
                title: 'Multi-Jump',
                desc: `Allows additional air jumps. Current: ${currentRank === 0 ? 'Ground only' : `${currentRank + 1} total jumps`}. Next: ${currentRank >= 5 ? 'MAX' : `${currentRank + 2} total jumps`}`
            },
            speed: {
                title: 'Super Speed',
                desc: `Increases movement speed. Current: ${currentRank === 0 ? 'Normal' : `Tier ${currentRank}`}. Next: ${currentRank >= 5 ? 'MAX' : `Tier ${currentRank + 1} speed`}`
            },
            fastFall: {
                title: 'Fast Fall',
                desc: `Fall faster when holding DOWN. Current: ${currentRank === 0 ? 'Normal fall' : `${800 + currentRank * 100} fall speed`}. Next: ${currentRank >= 5 ? 'MAX' : `${900 + currentRank * 100} fall speed`}`
            },
            slowBombs: {
                title: 'Slow Bombs',
                desc: `Permanently slows bomb movement. Current: ${currentRank === 0 ? 'Normal bombs' : `${Math.round((1 - [0.85, 0.70, 0.55, 0.40, 0.25][currentRank-1]) * 100)}% slower`}. Next: ${currentRank >= 5 ? 'MAX' : `${Math.round((1 - [0.85, 0.70, 0.55, 0.40, 0.25][currentRank]) * 100)}% slower`}`
            },
            starMagnet: {
                title: 'Star Magnet',
                desc: `Attracts nearby stars automatically. Current: ${currentRank === 0 ? 'No attraction' : `${[80, 100, 130, 170, 220][currentRank-1]} range`}. Next: ${currentRank >= 5 ? 'MAX' : `${[80, 100, 130, 170, 220][currentRank]} range`}`
            },
            starMultiplier: {
                title: 'Star Multiplier',
                desc: `Increases points per star collected. Current: ${[9, 11, 13, 15][currentRank]} points per star. Next: ${currentRank >= 3 ? 'MAX' : `${[9, 11, 13, 15][currentRank + 1]} points per star`}`
            },
            extraLife: {
                title: 'Extra Life',
                desc: 'Immediately grants +1 life. Can be purchased multiple times. No limit!'
            },
            barrier: {
                title: 'Energy Barrier',
                desc: `Blocks bombs temporarily (W key). Charges with 110 star points. Current: ${currentRank === 0 ? 'Locked' : currentRank === 1 ? '4s duration' : currentRank === 2 ? '6s duration' : '8s duration'}. ${currentRank >= 3 ? 'MAX' : 'Next: Longer duration'}`
            },
            emp: {
                title: 'EMP Blast',
                desc: `Destroys all bombs (E key). Requires ${[600, 550, 500][Math.min(currentRank, 2)]} star points. Current: ${currentRank === 0 ? 'Locked' : `${[8, 6, 4][currentRank-1]}s delay`}. ${currentRank >= 3 ? 'MAX' : 'Next: Faster recharge'}`
            },
            platformDrop: {
                title: 'Platform Phasing',
                desc: `Pass through platforms. Current: ${currentRank === 0 ? 'Locked' : currentRank === 1 ? 'Jump up through platforms' : currentRank === 2 ? 'Drop down through platforms (DOWN key)' : 'Drop through ALL platforms'}. ${currentRank >= 3 ? 'MAX' : 'Next: More platform access'}`
            },
            tokenBonus: {
                title: 'Token Bonus',
                desc: `Extra tokens per level completed. Current: ${currentRank === 0 ? 'No bonus' : `+${[2, 3, 4][currentRank-1]} tokens per level`}. ${currentRank >= 3 ? 'MAX' : `Next: +${[2, 3, 4][currentRank]} tokens per level`}`
            },
            sonicBoom: {
                title: 'Sonic Boom',
                desc: `Throw pulse grenade to destroy bombs (Q key). Recharges every 900 points. Current: ${currentRank === 0 ? 'Locked' : currentRank === 1 ? 'Destroy 1 bomb per charge' : currentRank === 2 ? 'Destroy 2 bombs per charge' : 'Destroy 3 bombs per charge'}. ${currentRank >= 3 ? 'MAX' : `Next: ${currentRank === 0 ? 'Destroy 1 bomb' : currentRank === 1 ? 'Destroy 2 bombs' : 'Destroy 3 bombs'} per charge`}`
            },
            lifeRegen: {
                title: 'Life Regen',
                desc: `Regenerate lives by collecting star points. Current: ${currentRank === 0 ? 'Locked' : `${375 - ((currentRank - 1) * 25)} points needed per life`}. ${currentRank >= 5 ? 'MAX' : `Next: ${currentRank === 0 ? '375 points per life' : `${375 - (currentRank * 25)} points per life`}`}`
            }
        };
        
        return descriptions[abilityName] || { title: 'Unknown', desc: 'No description available.' };
    }

    // Custom collision process for platform drop ability
    platformCollisionProcess(player, platform) {
        // Tier 1: Platform Jump - allows jumping through platforms from below
        if (this.player.platformJumpUnlocked && 
            player.body.velocity.y < 0 && // Player is moving upward (jumping)
            player.body.bottom > platform.body.top) { // Player is coming from below
            return false; // Don't collide - let player pass through
        }
        
        // Tier 2: Platform Drop - allows dropping through platforms with down key
        if (this.player.platformDropUnlocked && 
            this.cursors.down.isDown && // Player is pressing down
            player.body.velocity.y > 0 && // Player is falling
            player.y < platform.y) { // Player is above the platform
            
            // Check if this is a restricted platform (ground or tall left wall)
            const isGroundPlatform = Math.abs(platform.y - 950) < 5; // Ground platform at y=950
            const isTallWallPlatform = Math.abs(platform.y - 825) < 5; // Tall left wall platform at y=825
            
            // Tier 3 required: Only allow dropping through ground and tall wall with third upgrade
            if ((isGroundPlatform || isTallWallPlatform) && !this.player.platformDropAllUnlocked) {
                return true; // Prevent drop-through for these platforms without tier 3
            }
            
            return false; // Don't collide - let player pass through
        }
        
        return true; // Normal collision (land on top when falling)
    }

    // Life Regen UI functions
    createLifeRegenUI() {
        // Only create if Life Regen is unlocked
        if (this.player.abilityRanks.lifeRegen === 0) {
            return;
        }

        // Create Life Regen meter next to lives counter
        // Lives counter is at (725, 16), so position Life Regen UI to the left with some spacing
        const lifeRegenX = 480; // Position further to the left of lives counter
        const lifeRegenY = 16;
        
        // Background for the meter
        this.lifeRegenBg = this.add.rectangle(lifeRegenX, lifeRegenY + 5, 160, 16, 0x444444);
        this.lifeRegenBg.setOrigin(0, 0);
        this.lifeRegenBg.setScrollFactor(0);
        this.lifeRegenBg.setDepth(1000);
        this.lifeRegenBg.setStrokeStyle(2, 0xffffff);
        
        // Progress bar for the meter
        this.lifeRegenBar = this.add.rectangle(lifeRegenX + 2, lifeRegenY + 7, 1, 12, 0x00ff88);
        this.lifeRegenBar.setOrigin(0, 0);
        this.lifeRegenBar.setScrollFactor(0);
        this.lifeRegenBar.setDepth(1001);
        
        // Label for the meter - positioned to the left of the progress bar
        this.lifeRegenLabel = this.add.text(lifeRegenX - 100, lifeRegenY + 11, 'LIFE REGEN', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff'
        });
        this.lifeRegenLabel.setScrollFactor(0);
        this.lifeRegenLabel.setDepth(1002);
    }

    updateLifeRegenUI() {
        // Only update if Life Regen is unlocked
        if (this.player.abilityRanks.lifeRegen === 0) {
            // Hide UI elements if Life Regen is locked
            if (this.lifeRegenBg) {
                this.lifeRegenBg.setVisible(false);
                this.lifeRegenBar.setVisible(false);
                this.lifeRegenLabel.setVisible(false);
            }
            return;
        }

        // Show UI elements if they exist
        if (this.lifeRegenBg) {
            this.lifeRegenBg.setVisible(true);
            this.lifeRegenBar.setVisible(true);
            this.lifeRegenLabel.setVisible(true);
        } else {
            // Create UI if it doesn't exist and Life Regen is unlocked
            this.createLifeRegenUI();
        }

        // Update progress bar only when values change
        if (this.lifeRegenBar) {
            const progress = this.player.getLifeRegenProgress();
            
            // Check if values have changed since last update
            if (!this.lastLifeRegenProgress || 
                this.lastLifeRegenProgress.current !== progress.current || 
                this.lastLifeRegenProgress.needed !== progress.needed) {
                
                const maxWidth = 156; // Adjusted for larger bar (160 - 4 for padding)
                const currentWidth = Math.max(1, Math.min(maxWidth, maxWidth * (progress.current / progress.needed)));
                
                this.lifeRegenBar.setSize(currentWidth, 12);
                
                // Change color and label when ready for extra life
                if (progress.current >= progress.needed) {
                    this.lifeRegenBar.setFillStyle(0xffff00); // Yellow when ready
                    this.lifeRegenLabel.setText('READY!');
                    this.lifeRegenLabel.setColor('#ffff00');
                } else {
                    this.lifeRegenBar.setFillStyle(0x00ff88); // Green for normal progress
                    this.lifeRegenLabel.setText(`LIFE REGEN (${progress.current}/${progress.needed})`);
                    this.lifeRegenLabel.setColor('#ffffff');
                }
                
                // Store current values for next comparison
                this.lastLifeRegenProgress = {
                    current: progress.current,
                    needed: progress.needed
                };
            }
        }
    }

    // Clear old version data - ensures fresh start for new version
    clearOldVersionData() {
        const CURRENT_VERSION = '3.0';
        const storedVersion = localStorage.getItem('gameVersion');
        
        // If no version is stored or it's different from current version, clear old data
        if (!storedVersion || storedVersion !== CURRENT_VERSION) {
            console.log('New version detected! Clearing old data for fresh start...');
            
            // Clear all game-related localStorage items
            localStorage.removeItem('highScore');
            localStorage.removeItem('highestLevel');
            localStorage.removeItem('playerData');
            localStorage.removeItem('abilities');
            localStorage.removeItem('tokens');
            localStorage.removeItem('specialTokens');
            localStorage.removeItem('upgrades');
            localStorage.removeItem('stars');
            localStorage.removeItem('lives');
            localStorage.removeItem('level');
            localStorage.removeItem('score');
            
            // Set the new version
            localStorage.setItem('gameVersion', CURRENT_VERSION);
            
            console.log('Old data cleared! Starting fresh with version', CURRENT_VERSION);
            
            // Show version update notification
            this.showVersionUpdateNotification();
        }
    }
    
    // Show notification that the game has been updated
    showVersionUpdateNotification() {
        // Create notification background
        let notificationBg = this.add.rectangle(725, 200, 600, 120, 0x000000, 0.95);
        notificationBg.setStrokeStyle(3, 0x00ff00);
        notificationBg.setDepth(2000);
        
        // Title
        let title = this.add.text(725, 170, 'GAME UPDATED!', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        title.setDepth(2001);
        
        // Message
        let message = this.add.text(725, 200, 'Welcome to BombDrop v3.0!\nYour progress has been reset for the new version.', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        message.setDepth(2001);
        
        // Subtext
        let subtext = this.add.text(725, 235, 'New features: Life Regen, balanced abilities, improved gameplay!', {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#ffff00'
        }).setOrigin(0.5);
        subtext.setDepth(2001);
        
        // Auto-hide after 5 seconds
        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: [notificationBg, title, message, subtext],
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    notificationBg.destroy();
                    title.destroy();
                    message.destroy();
                    subtext.destroy();
                }
            });
        });
    }
}