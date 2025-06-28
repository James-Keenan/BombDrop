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
        
        // Track if increased movement speed is unlocked
        this.increasedSpeedUnlocked = false;
        this.baseMovementSpeed = 200; // Base movement speed
        this.speedTier1 = 280; // Speed tier 1
        this.speedTier2 = 360; // Speed tier 2
        this.speedTier3 = 440; // Speed tier 3
        
        // Barrier ability properties (unlocks at level 3)
        this.barrierUnlocked = false;
        this.barrierActive = false;
        this.barrierCharge = 100; // 0-100, starts full
        this.barrierMaxCharge = 100;
        this.barrierDuration = 3000; // 3 seconds
        this.barrierCooldown = 8000; // 8 seconds to fully recharge
        this.barrierGraphics = null; // Will hold the barrier visual effect
        
        // Token-based upgrade system
        this.tokens = 0;
        this.specialTokens = 0;
        
        // Ability ranks - all start at 0 (locked)
        this.abilityRanks = {
            jump: 0,       // 0=locked, 1=double, 2=triple, 3=quad
            speed: 0,      // 0=locked, 1-3=speed tiers
            fastFall: 0,   // 0=locked, 1=unlocked
            barrier: 0,    // 0=locked, 1=unlocked, 2=improved
            timeFreeze: 0, // 0=locked, 1=unlocked, 2=improved
            slowBombs: 0,  // 0=locked, 1-4=permanent slow tiers
            starMagnet: 0, // 0=locked, 1-4=magnetic strength tiers
            emp: 0         // 0=locked, 1=unlocked, 2=improved
        };
        
        // Time freeze ability
        this.timeFreezeActive = false;
        this.timeFreezeDuration = 2000; // 2 seconds base
        this.timeFreezeCooldown = 10000; // 10 seconds base
        this.timeFreezeCharge = 100;
        this.timeFreezeMaxCharge = 100;
        
        // EMP ability properties
        this.empUnlocked = false;
        this.empAvailable = false;
        this.starsCollected = 0; // Track total stars collected
        this.starsNeededForEMP = 200; // Stars needed to charge EMP
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
    const currentSpeed = this.getCurrentSpeed();
    this.setVelocityX(-currentSpeed);
    this.anims.play('left', true);
}

moveRight(){
    const currentSpeed = this.getCurrentSpeed();
    this.setVelocityX(currentSpeed);
    this.anims.play('right', true);
}

idle(){
    this.setVelocityX(0);
    this.anims.play('turn');
}

getCurrentSpeed() {
    const speedRank = this.abilityRanks.speed;
    switch (speedRank) {
        case 1: return this.speedTier1;
        case 2: return this.speedTier2;
        case 3: return this.speedTier3;
        default: return this.baseMovementSpeed;
    }
}

jump(){
    if (this.body.blocked.down) {
        // Ground jump - always available (made weaker)
        this.setVelocityY(-520); // Weaker ground jump (was -600)
        this.jumpsRemaining = this.getMaxJumps() - 1; // Set remaining jumps after ground jump
    } else if (this.jumpsRemaining > 0) {
        // Air jumps based on jump rank
        if (this.jumpsRemaining === 3 && this.abilityRanks.jump >= 3) {
            // Second jump (double jump) - when quad jump is unlocked
            this.setVelocityY(-520); // Strong air jump
            
            // Visual effect for double jump
            this.setTint(0x00ffff); // Brief cyan tint
            this.gameScene.time.delayedCall(100, () => {
                this.setTint(0xffffff); // Reset to normal
            });
        } else if (this.jumpsRemaining === 2 && this.abilityRanks.jump >= 3) {
            // Third jump (triple jump) - when quad jump is unlocked
            this.setVelocityY(-480); // Medium air jump
            
            // Visual effect for triple jump
            this.setTint(0xffff00); // Brief yellow tint
            this.gameScene.time.delayedCall(120, () => {
                this.setTint(0xffffff); // Reset to normal
            });
        } else if (this.jumpsRemaining === 1 && this.abilityRanks.jump >= 3) {
            // Fourth jump (quad jump) - final air jump
            this.setVelocityY(-420); // Weakest air jump
            
            // Visual effect for quad jump
            this.setTint(0xff00ff); // Brief magenta tint
            this.gameScene.time.delayedCall(150, () => {
                this.setTint(0xffffff); // Reset to normal
            });
        } else if (this.jumpsRemaining === 2 && this.abilityRanks.jump >= 2) {
            // Second jump (double jump) - when triple jump is unlocked
            this.setVelocityY(-500); // Medium air jump
            
            // Visual effect for double jump
            this.setTint(0x00ffff); // Brief cyan tint
            this.gameScene.time.delayedCall(100, () => {
                this.setTint(0xffffff); // Reset to normal
            });
        } else if (this.jumpsRemaining === 1 && this.abilityRanks.jump >= 2) {
            // Third jump (triple jump) - final air jump
            this.setVelocityY(-400); // Weakest air jump
            
            // Visual effect for triple jump
            this.setTint(0xffff00); // Brief yellow tint
            this.gameScene.time.delayedCall(150, () => {
                this.setTint(0xffffff); // Reset to normal
            });
        } else if (this.jumpsRemaining === 1 && this.abilityRanks.jump >= 1) {
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
        
        this.jumpsRemaining--;
    }
}

fastFall(){
    // Only allow fast fall when unlocked and in the air and falling (positive Y velocity)
    if (this.abilityRanks.fastFall >= 1 && !this.body.blocked.down && this.body.velocity.y > 0) {
        this.setVelocityY(800); // Fast fall speed
    }
}

// Token-based upgrade system methods
earnTokens(amount) {
    this.tokens += amount;
}

earnSpecialToken() {
    this.specialTokens += 1;
}

getCurrentJumpAbilityName() {
        const currentRank = this.abilityRanks.jump;
        if (currentRank === 0) return 'Single Jump';
        if (currentRank === 1) return 'Double Jump';
        if (currentRank === 2) return 'Triple Jump';
        if (currentRank === 3) return 'Quad Jump';
        return 'Jump'; // Fallback
    }

getJumpUpgradeName() {
        const nextRank = this.abilityRanks.jump + 1;
        if (nextRank === 1) return 'Double Jump';
        if (nextRank === 2) return 'Triple Jump';
        if (nextRank === 3) return 'Quad Jump';
        return 'Jump'; // Fallback or max rank
    }

getStarMagnetUpgradeName() {
        const currentRank = this.abilityRanks.starMagnet;
        const tierNames = ['Star Magnet I', 'Star Magnet II', 'Star Magnet III', 'Star Magnet IV'];
        if (currentRank >= 4) return 'Star Magnet MAX';
        return tierNames[currentRank] || 'Star Magnet I';
    }

getSlowBombsUpgradeName() {
        const currentRank = this.abilityRanks.slowBombs;
        const tierNames = ['Slow Bombs I', 'Slow Bombs II', 'Slow Bombs III', 'Slow Bombs IV'];
        if (currentRank >= 4) return 'Slow Bombs MAX';
        return tierNames[currentRank] || 'Slow Bombs I';
    }

getSpeedUpgradeName() {
        const nextRank = this.abilityRanks.speed + 1;
        if (nextRank === 1) return 'Super Speed I';
        if (nextRank === 2) return 'Super Speed II';
        if (nextRank === 3) return 'Super Speed III';
        return 'Super Speed'; // Fallback or max rank
    }

getMaxJumps() {
    if (this.abilityRanks.jump >= 3) return 4; // Quad jump
    if (this.abilityRanks.jump >= 2) return 3; // Triple jump
    if (this.abilityRanks.jump >= 1) return 2; // Double jump
    return 1; // Ground jump only
}

canUpgrade(abilityName) {
    const rank = this.abilityRanks[abilityName];
    const maxRank = this.getMaxRank(abilityName);
    
    if (rank >= maxRank) return false; // Already at max rank
    
    const cost = this.getUpgradeCost(abilityName, rank);
    const requiresSpecialToken = this.requiresSpecialToken(abilityName, rank);
    
    if (requiresSpecialToken && this.specialTokens < cost.specialTokens) return false;
    if (this.tokens < cost.tokens) return false;
    
    return true;
}

getUpgradeCost(abilityName, currentRank) {
    const costs = {
        jump: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }],
        speed: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }],
        fastFall: [{ tokens: 1, specialTokens: 0 }],
        barrier: [{ tokens: 0, specialTokens: 1 }, { tokens: 3, specialTokens: 1 }],
        timeFreeze: [{ tokens: 0, specialTokens: 1 }, { tokens: 4, specialTokens: 1 }],
        slowBombs: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }],
        starMagnet: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }],
        emp: [{ tokens: 0, specialTokens: 1 }, { tokens: 3, specialTokens: 0 }]
    };
    
    return costs[abilityName][currentRank] || { tokens: 0, specialTokens: 0 };
}

getMaxRank(abilityName) {
    const maxRanks = {
        jump: 3, speed: 3, fastFall: 1, barrier: 2,
        timeFreeze: 2, slowBombs: 4, starMagnet: 4, emp: 2
    };
    return maxRanks[abilityName] || 1;
}

requiresSpecialToken(abilityName, currentRank) {
    if (abilityName === 'barrier' || abilityName === 'timeFreeze') {
        return true; // Always requires special tokens
    }
    if (abilityName === 'emp' && currentRank === 0) {
        return true; // Only first EMP upgrade requires special token
    }
    return false;
}

upgradeAbility(abilityName) {
    if (!this.canUpgrade(abilityName)) return false;
    
    const cost = this.getUpgradeCost(abilityName, this.abilityRanks[abilityName]);
    
    // Spend tokens
    this.tokens -= cost.tokens;
    if (cost.specialTokens > 0) {
        this.specialTokens -= cost.specialTokens;
    }
    
    // Increase rank
    this.abilityRanks[abilityName]++;
    
    // Update dependent properties
    this.updateAbilityProperties();
    
    return true;
}

updateAbilityProperties() {
    // Update jump properties
    this.maxJumps = this.getMaxJumps();
    
    // Update speed
    this.increasedSpeedUnlocked = this.abilityRanks.speed >= 1;
    
    // Update other abilities
    this.fastFallUnlocked = this.abilityRanks.fastFall >= 1;
    this.barrierUnlocked = this.abilityRanks.barrier >= 1;
    this.empUnlocked = this.abilityRanks.emp >= 1;
    
    // Update barrier properties based on rank
    if (this.abilityRanks.barrier >= 2) {
        this.barrierDuration = 4000; // Improved duration
        this.barrierCooldown = 6000; // Faster cooldown
    }
    
    // Update time freeze properties based on rank
    if (this.abilityRanks.timeFreeze >= 2) {
        this.timeFreezeDuration = 3000; // Improved duration
        this.timeFreezeCooldown = 8000; // Faster cooldown
    }
    
    // Update EMP properties based on rank
    if (this.abilityRanks.emp >= 2) {
        this.starsNeededForEMP = 150; // Improved - needs fewer stars
    }
}

// Activate barrier ability
activateBarrier() {
    if (this.abilityRanks.barrier < 1 || this.barrierActive || this.barrierCharge < 100) {
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
        this.jumpsRemaining = this.getMaxJumps(); // Reset jumps when landing
    }
    
    // Track ground state for next frame
    this.wasOnGround = this.body.blocked.down;
    
    // Recharge barrier over time
    if (this.abilityRanks.barrier >= 1 && !this.barrierActive && this.barrierCharge < this.barrierMaxCharge) {
        this.barrierCharge += this.barrierMaxCharge / (this.barrierCooldown / 16.67); // Assuming 60 FPS
        if (this.barrierCharge > this.barrierMaxCharge) {
            this.barrierCharge = this.barrierMaxCharge;
        }
    }
    
    // Recharge time freeze over time
    if (this.abilityRanks.timeFreeze >= 1 && !this.timeFreezeActive && this.timeFreezeCharge < this.timeFreezeMaxCharge) {
        this.timeFreezeCharge += this.timeFreezeMaxCharge / (this.timeFreezeCooldown / 16.67); // Assuming 60 FPS
        if (this.timeFreezeCharge > this.timeFreezeMaxCharge) {
            this.timeFreezeCharge = this.timeFreezeMaxCharge;
        }
    }
    
    // Update barrier visual effect if active
    if (this.barrierActive) {
        this.updateBarrierEffect();
    }
}

// Activate time freeze ability
activateTimeFreeze() {
    if (this.abilityRanks.timeFreeze < 1 || this.timeFreezeActive || this.timeFreezeCharge < 100) {
        return false; // Can't activate
    }
    
    this.timeFreezeActive = true;
    this.timeFreezeCharge = 0; // Use up all charge
    
    // Slow down physics for bombs and stars
    this.gameScene.physics.world.timeScale = 0.2; // Slow time
    
    // Visual effect - tint the screen
    this.gameScene.cameras.main.setTint(0x88ccff);
    
    // Deactivate after duration
    this.gameScene.time.delayedCall(this.timeFreezeDuration, () => {
        this.deactivateTimeFreeze();
    });
    
    return true;
}

// Deactivate time freeze
deactivateTimeFreeze() {
    this.timeFreezeActive = false;
    
    // Restore normal time
    this.gameScene.physics.world.timeScale = 1.0;
    
    // Remove visual effect
    this.gameScene.cameras.main.clearTint();
}

    // Get the bomb slow factor based on upgrade level (permanent stat)
    getBombSlowFactor() {
        const slowLevels = [1.0, 0.75, 0.55, 0.35, 0.20]; // 0=normal, 1-4=increasingly slower and more powerful
        return slowLevels[this.abilityRanks.slowBombs] || 1.0;
    }

// Apply magnetic effect to stars (Star Magnet ability)
applyStarMagnet(stars) {
    if (this.abilityRanks.starMagnet < 1) return;
    
    // Progressive tier system - current level 2 becomes level 4
    const magnetRanges = [0, 100, 125, 175, 250]; // Tier 1-4 ranges (tier 4 was old tier 2)
    const magnetForces = [0, 200, 250, 325, 400]; // Tier 1-4 forces (tier 4 was old tier 2)
    
    const magnetRange = magnetRanges[this.abilityRanks.starMagnet] || 100;
    const magnetForce = magnetForces[this.abilityRanks.starMagnet] || 200;
    
    stars.children.entries.forEach(star => {
        if (star.active) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, star.x, star.y);
            
            if (distance < magnetRange && distance > 20) {
                // Calculate direction from star to player
                const angle = Phaser.Math.Angle.Between(star.x, star.y, this.x, this.y);
                
                // Apply magnetic force (stronger when closer)
                const force = magnetForce * (1 - distance / magnetRange);
                const velocityX = Math.cos(angle) * force;
                const velocityY = Math.sin(angle) * force;
                
                star.setVelocity(velocityX, velocityY);
                
                // Visual effect
                if (!star.magnetTint) {
                    star.setTint(0xffff00);
                    star.magnetTint = true;
                    
                    this.gameScene.time.delayedCall(300, () => {
                        if (star.active) {
                            star.setTint(0xffffff);
                            star.magnetTint = false;
                        }
                    });
                }
            }
        }
    });
}

// Track star collection for EMP charging
collectStar() {
        this.starsCollected++;
        if (this.empUnlocked && this.starsCollected >= this.starsNeededForEMP && !this.empAvailable) {
            this.empAvailable = true;
            this.starsCollected = 0; // Reset counter
        }
    }
    
    // Activate EMP ability
    activateEMP(bombs) {
        if (!this.empUnlocked || !this.empAvailable) {
            return false; // Can't activate
        }
        
        // Find the closest bomb to destroy
        let closestBomb = null;
        let closestDistance = Infinity;
        
        bombs.children.entries.forEach(bomb => {
            if (bomb.active) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, bomb.x, bomb.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestBomb = bomb;
                }
            }
        });
        
        if (closestBomb) {
            // Create dramatic explosion effect
            this.createEMPEffect(closestBomb.x, closestBomb.y);
            
            // Destroy the bomb
            closestBomb.destroy();
            
            // Use up the EMP
            this.empAvailable = false;
            this.starsCollected = 0;
            
            return true;
        }
        
        return false;
    }
    
    // Create EMP explosion visual effect
    createEMPEffect(x, y) {
        // Create electric explosion effect
        const empGraphics = this.gameScene.add.graphics();
        
        // Create multiple electric rings
        for (let i = 0; i < 5; i++) {
            this.gameScene.time.delayedCall(i * 50, () => {
                empGraphics.clear();
                empGraphics.lineStyle(4, 0x00ffff, 1 - (i * 0.2));
                empGraphics.strokeCircle(x, y, 20 + (i * 30));
                
                empGraphics.lineStyle(6, 0xffffff, 1 - (i * 0.2));
                empGraphics.strokeCircle(x, y, 10 + (i * 20));
            });
        }
        
        // Screen shake effect
        this.gameScene.cameras.main.shake(300, 0.02);
        
        // Clean up after animation
        this.gameScene.time.delayedCall(500, () => {
            if (empGraphics) {
                empGraphics.destroy();
            }
        });
    }

    // Activate barrier ability
    activateBarrier() {
        if (this.abilityRanks.barrier < 1 || this.barrierActive || this.barrierCharge < 100) {
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
            this.jumpsRemaining = this.getMaxJumps(); // Reset jumps when landing
        }
        
        // Track ground state for next frame
        this.wasOnGround = this.body.blocked.down;
        
        // Recharge barrier over time
        if (this.abilityRanks.barrier >= 1 && !this.barrierActive && this.barrierCharge < this.barrierMaxCharge) {
            this.barrierCharge += this.barrierMaxCharge / (this.barrierCooldown / 16.67); // Assuming 60 FPS
            if (this.barrierCharge > this.barrierMaxCharge) {
                this.barrierCharge = this.barrierMaxCharge;
            }
        }
        
        // Recharge time freeze over time
        if (this.abilityRanks.timeFreeze >= 1 && !this.timeFreezeActive && this.timeFreezeCharge < this.timeFreezeMaxCharge) {
            this.timeFreezeCharge += this.timeFreezeMaxCharge / (this.timeFreezeCooldown / 16.67); // Assuming 60 FPS
            if (this.timeFreezeCharge > this.timeFreezeMaxCharge) {
                this.timeFreezeCharge = this.timeFreezeMaxCharge;
            }
        }
        
        // Update barrier visual effect if active
        if (this.barrierActive) {
            this.updateBarrierEffect();
        }
    }

    // Activate time freeze ability
    activateTimeFreeze() {
        if (this.abilityRanks.timeFreeze < 1 || this.timeFreezeActive || this.timeFreezeCharge < 100) {
            return false; // Can't activate
        }
        
        this.timeFreezeActive = true;
        this.timeFreezeCharge = 0; // Use up all charge
        
        // Slow down physics for bombs and stars
        this.gameScene.physics.world.timeScale = 0.2; // Slow time
        
        // Visual effect - tint the screen
        this.gameScene.cameras.main.setTint(0x88ccff);
        
        // Deactivate after duration
        this.gameScene.time.delayedCall(this.timeFreezeDuration, () => {
            this.deactivateTimeFreeze();
        });
        
        return true;
    }

    // Deactivate time freeze
    deactivateTimeFreeze() {
        this.timeFreezeActive = false;
        
        // Restore normal time
        this.gameScene.physics.world.timeScale = 1.0;
        
        // Remove visual effect
        this.gameScene.cameras.main.clearTint();
    }

    // Apply magnetic effect to stars (Star Magnet ability)
    applyStarMagnet(stars) {
        if (this.abilityRanks.starMagnet < 1) return;
        
        // Progressive tier system - current level 2 becomes level 4
        const magnetRanges = [0, 100, 125, 175, 250]; // Tier 1-4 ranges (tier 4 was old tier 2)
        const magnetForces = [0, 200, 250, 325, 400]; // Tier 1-4 forces (tier 4 was old tier 2)
        
        const magnetRange = magnetRanges[this.abilityRanks.starMagnet] || 100;
        const magnetForce = magnetForces[this.abilityRanks.starMagnet] || 200;
        
        stars.children.entries.forEach(star => {
            if (star.active) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, star.x, star.y);
                
                if (distance < magnetRange && distance > 20) {
                    // Calculate direction from star to player
                    const angle = Phaser.Math.Angle.Between(star.x, star.y, this.x, this.y);
                    
                    // Apply magnetic force (stronger when closer)
                    const force = magnetForce * (1 - distance / magnetRange);
                    const velocityX = Math.cos(angle) * force;
                    const velocityY = Math.sin(angle) * force;
                    
                    star.setVelocity(velocityX, velocityY);
                    
                    // Visual effect
                    if (!star.magnetTint) {
                        star.setTint(0xffff00);
                        star.magnetTint = true;
                        
                        this.gameScene.time.delayedCall(300, () => {
                            if (star.active) {
                                star.setTint(0xffffff);
                                star.magnetTint = false;
                            }
                        });
                    }
                }
            }
        });
    }

}