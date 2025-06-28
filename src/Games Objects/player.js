export class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y){
        super(scene, x, y, 'dude');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.initAnimations();
        
        // Store reference to the scene to access level
        this.gameScene = scene;
        
        // Air jumping properties - will be updated based on level
        this.baseJumps = 1; // Ground jump only
        this.maxJumps = this.baseJumps;
        this.jumpsRemaining = this.maxJumps;
        this.wasOnGround = false;
        
        // Track if double jump is unlocked
        this.doubleJumpUnlocked = false;
        
        // Track if triple jump is unlocked
        this.tripleJumpUnlocked = false;
        
        // Track if fast fall is unlocked
        this.fastFallUnlocked = false;
        
        // Barrier ability properties (unlocks at level 3)
        this.barrierUnlocked = false;
        this.barrierActive = false;
        this.barrierCharge = 100; // 0-100, starts full
        this.barrierMaxCharge = 100;
        this.barrierDuration = 3000; // 3 seconds
        this.barrierCooldown = 8000; // 8 seconds to fully recharge
        this.barrierGraphics = null; // Will hold the barrier visual effect
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
        // Ground jump is strongest
        if (this.body.blocked.down) {
            this.setVelocityY(-500);
        } else {
            // Air jumps - check in order of remaining jumps
            if (this.jumpsRemaining === 2 && this.tripleJumpUnlocked) {
                // Second jump (when triple jump is available, this is the first air jump)
                this.setVelocityY(-450); // Air jump
                
                // Visual effect for second jump
                this.setTint(0x00ffff); // Brief cyan tint
                this.gameScene.time.delayedCall(100, () => {
                    this.setTint(0xffffff); // Reset to normal
                });
            } else if (this.jumpsRemaining === 1 && this.tripleJumpUnlocked) {
                // Third jump (triple jump) - final air jump
                this.setVelocityY(-400); // Weakest air jump
                
                // Visual effect for triple jump
                this.setTint(0xffff00); // Brief yellow tint
                this.gameScene.time.delayedCall(150, () => {
                    this.setTint(0xffffff); // Reset to normal
                });
            } else if (this.jumpsRemaining === 1 && this.doubleJumpUnlocked && !this.tripleJumpUnlocked) {
                // Double jump (when only double jump is available)
                this.setVelocityY(-450); // Air jump
                
                // Visual effect for double jump
                this.setTint(0x00ffff); // Brief cyan tint
                this.gameScene.time.delayedCall(100, () => {
                    this.setTint(0xffffff); // Reset to normal
                });
            } else {
                // Jump not unlocked yet
                return; // Don't consume jump
            }
        }
        
        this.jumpsRemaining--;
    }
}

fastFall(){
    // Only allow fast fall when unlocked and in the air and falling (positive Y velocity)
    if (this.fastFallUnlocked && !this.body.blocked.down && this.body.velocity.y > 0) {
        this.setVelocityY(800); // Fast fall speed
    }
}

// Method to update jump abilities based on level
updateJumpAbilities(level) {
    if (level >= 2 && !this.doubleJumpUnlocked) {
        this.doubleJumpUnlocked = true;
        this.maxJumps = 2; // Ground jump + double jump
        console.log('Double jump unlocked!');
    }
    
    if (level >= 3 && !this.fastFallUnlocked) {
        this.fastFallUnlocked = true;
        console.log('Fast fall unlocked!');
    }
    
    if (level >= 4 && !this.tripleJumpUnlocked) {
        this.tripleJumpUnlocked = true;
        this.maxJumps = 3; // Ground jump + double jump + triple jump
        console.log('Triple jump unlocked!');
    }
    
    if (level >= 5 && !this.barrierUnlocked) {
        this.barrierUnlocked = true;
        console.log('Barrier ability unlocked!');
    }
}

// Activate barrier ability
activateBarrier() {
    if (!this.barrierUnlocked || this.barrierActive || this.barrierCharge < 100) {
        return false; // Can't activate
    }
    
    this.barrierActive = true;
    this.barrierCharge = 0; // Use up all charge
    
    // Create glowing barrier visual effect
    this.createBarrierEffect();
    
    // Deactivate after duration
    this.gameScene.time.delayedCall(this.barrierDuration, () => {
        this.deactivateBarrier();
    });
    
    return true; // Successfully activated
}

// Create the glowing barrier visual effect
createBarrierEffect() {
    if (this.barrierGraphics) {
        this.barrierGraphics.destroy();
    }
    
    this.barrierGraphics = this.gameScene.add.graphics();
    
    // Create a pulsing glow effect
    this.updateBarrierEffect();
    
    // Animate the barrier with pulsing effect
    this.gameScene.tweens.add({
        targets: this,
        duration: 200,
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
            this.updateBarrierEffect();
        }
    });
}

// Update barrier visual effect position and appearance
updateBarrierEffect() {
    if (!this.barrierGraphics || !this.barrierActive) return;
    
    this.barrierGraphics.clear();
    
    // Create much smaller, more subtle visual effect
    const time = this.gameScene.time.now * 0.01; // Faster pulsing
    const pulseScale = 1 + Math.sin(time) * 0.15; // Moderate pulse amplitude
    
    // Small outer glow - much smaller radius
    this.barrierGraphics.lineStyle(4, 0x00ffff, 0.4);
    this.barrierGraphics.strokeCircle(this.x, this.y, 45 * pulseScale);
    
    // Small middle ring
    this.barrierGraphics.lineStyle(6, 0x00ffff, 0.6);
    this.barrierGraphics.strokeCircle(this.x, this.y, 35 * pulseScale);
    
    // Small inner core (brightest)
    this.barrierGraphics.lineStyle(4, 0xffffff, 0.8);
    this.barrierGraphics.strokeCircle(this.x, this.y, 25 * pulseScale);
}

// Deactivate barrier
deactivateBarrier() {
    this.barrierActive = false;
    
    if (this.barrierGraphics) {
        // Fade out effect
        this.gameScene.tweens.add({
            targets: this.barrierGraphics,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.barrierGraphics.destroy();
                this.barrierGraphics = null;
            }
        });
    }
}

// Check if barrier deflects bombs
deflectsBombs() {
    return this.barrierActive;
}

// Apply magnetic force to push bombs away
applyMagneticForce(bombs) {
    if (!this.barrierActive) return;
    
    const magneticRange = 200; // Keep the same range
    const pushSpeed = 300; // Controlled push speed (not accelerating)
    
    bombs.children.entries.forEach(bomb => {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, bomb.x, bomb.y);
        
        if (distance < magneticRange && distance > 0) {
            // Calculate push direction (away from player)
            const angle = Phaser.Math.Angle.Between(this.x, this.y, bomb.x, bomb.y);
            
            // Set controlled velocity to push bombs away at consistent speed
            // Closer bombs get pushed more directly, farther ones get gentler nudge
            const distanceRatio = (magneticRange - distance) / magneticRange;
            const currentPushSpeed = pushSpeed * (0.5 + distanceRatio * 0.5); // 50% to 100% of push speed
            
            // Set velocity directly instead of adding to existing velocity
            const pushX = Math.cos(angle) * currentPushSpeed;
            const pushY = Math.sin(angle) * currentPushSpeed;
            
            bomb.setVelocity(pushX, pushY);
            
            // Enhanced visual feedback - more intense glow for stronger force
            if (!bomb.magneticTint) {
                bomb.setTint(0x00ffff);
                bomb.magneticTint = true;
                
                // Add screen shake effect for bombs entering the field
                if (distance < 100) {
                    this.gameScene.cameras.main.shake(40, 0.01);
                }
                
                // Remove tint after a short delay
                this.gameScene.time.delayedCall(300, () => {
                    if (bomb.active) {
                        bomb.setTint(0xffffff);
                        bomb.magneticTint = false;
                    }
                });
            }
        }
    });
}

// Update method to reset jumps when touching ground
update() {
    // Check if player just landed on the ground
    if (this.body.blocked.down && !this.wasOnGround) {
        this.jumpsRemaining = this.maxJumps; // Reset jumps when landing
    }
    
    // Track ground state for next frame
    this.wasOnGround = this.body.blocked.down;
    
    // Recharge barrier over time
    if (this.barrierUnlocked && !this.barrierActive && this.barrierCharge < this.barrierMaxCharge) {
        this.barrierCharge += this.barrierMaxCharge / (this.barrierCooldown / 16.67); // Assuming 60 FPS
        if (this.barrierCharge > this.barrierMaxCharge) {
            this.barrierCharge = this.barrierMaxCharge;
        }
    }
    
    // Update barrier visual effect if active
    if (this.barrierActive) {
        this.updateBarrierEffect();
    }
}






}