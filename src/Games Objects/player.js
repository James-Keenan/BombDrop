export class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, characterKey = 'dude'){
        super(scene, x, y, characterKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.characterKey = characterKey; // Store the character key for animations
        
        // Scale different characters to be similar sizes
        this.setCharacterScale();
        
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
        
        // Track if platform abilities are unlocked
        this.platformJumpUnlocked = false; // Jump through platforms from below
        this.platformDropUnlocked = false; // Drop through platforms with down key
        this.platformDropAllUnlocked = false; // Drop through ground and tall walls
        
        // Track if increased movement speed is unlocked
        this.increasedSpeedUnlocked = false;
        this.baseMovementSpeed = 200; // Base movement speed
        this.speedTier1 = 260; // Nerfed: Speed tier 1 (reduced from 280)
        this.speedTier2 = 320; // Nerfed: Speed tier 2 (reduced from 360)
        this.speedTier3 = 380; // Nerfed: Speed tier 3 (reduced from 440)
        this.speedTier4 = 440; // Nerfed: Speed tier 4 (reduced from 520)
        this.speedTier5 = 500; // Nerfed: Speed tier 5 (reduced from 600)
        
        // Barrier ability properties (unlocks at level 3)
        this.barrierUnlocked = false;
        this.barrierActive = false;
        this.barrierCharge = 0; // 0-100, starts empty and charges with star points
        this.barrierMaxCharge = 100;
        this.barrierPointsCollected = 0; // Track star points for barrier charging
        this.barrierPointsNeededForCharge = 110; // Nerfed: increased from 90 to 110
        this.barrierDuration = 4000; // Nerfed: 4 seconds (reduced from 5)
        this.barrierCooldown = 12000; // 12 seconds to fully recharge (slower than before)
        this.barrierGraphics = null; // Will hold the barrier visual effect
        
        // Token-based upgrade system
        this.tokens = 0;
        this.specialTokens = 0;
        
        // Ability ranks - all start at 0 (locked)
        this.abilityRanks = {
            jump: 0,       // 0=locked, 1-5=double to hexa jump
            speed: 0,      // 0=locked, 1-5=speed tiers
            fastFall: 0,   // 0=locked, 1-5=fast fall tiers
            barrier: 0,    // 0=locked, 1=unlocked, 2=improved
            slowBombs: 0,  // 0=locked, 1-5=permanent slow tiers
            starMagnet: 0, // 0=locked, 1-5=magnetic strength tiers
            emp: 0,        // 0=locked, 1=unlocked, 2=improved
            platformDrop: 0, // 0=locked, 1=jump through, 2=drop through, 3=drop through all
            tokenBonus: 0, // 0=locked, 1=+2 tokens, 2=+3 tokens, 3=+4 tokens per level
            starMultiplier: 0, // 0=locked, 1=2x score, 2=3x score, 3=4x score
            extraLife: 0,   // 0=locked, can buy multiple times
            sonicBoom: 0,   // 0=locked, 1=1 bomb for 1 token, 2=2 bombs for 5 tokens, 3=3 bombs for 10 tokens
            lifeRegen: 0,   // 0=locked, 1-5=regenerate lives (325, 300, 275, 250, 225 points needed)
            zeroGravity: 0  // 0=locked, 1-5=zero gravity tiers
        };
        
        // EMP ability properties
        this.empUnlocked = false;
        this.empAvailable = false;
        this.starPointsCollected = 0; // Track total star points collected for EMP
        this.starPointsNeededForEMP = 600; // Nerfed: increased from 500 to 600
        this.empDelayTier1 = 8000; // 8 seconds delay (tier 1)
        this.empDelayTier2 = 6000; // 6 seconds delay (tier 2)
        this.empDelayTier3 = 4000; // 4 seconds delay (tier 3)
        this.empActive = false; // Track if EMP effect is active
        
        // Sonic Boom ability properties
        this.sonicBoomUnlocked = false;
        this.sonicBoomAvailable = 0; // Number of sonic booms available to use
        this.sonicBoomPointsCollected = 0; // Track points for sonic boom charging
        this.sonicBoomPointsNeededForCharge = 900; // Nerfed: increased from 750 to 900
        
        // Life Regen ability properties
        this.lifeRegenUnlocked = false;
        this.lifeRegenPointsCollected = 0; // Track points for life regeneration
        this.lifeRegenPointsNeededForLife = 375; // Nerfed: Base points needed for a new life (375, 350, 325, 300, 275)
        
        // Zero Gravity ability properties
        this.zeroGravityUnlocked = false;
        this.zeroGravityActive = false;
        this.zeroGravityAvailable = false;
        this.zeroGravityStarPointsCollected = 0; // Track star points for Zero Gravity recharging
        this.zeroGravityStarPointsNeeded = 250; // Base star points needed to recharge (250, 225, 200)
        this.zeroGravityCooldown = 0;
        this.zeroGravityCooldownMax = 0;
        this.zeroGravityStarMagnetBonus = false;
        this.zeroGravityEffectTimer = null;
        this.zeroGravityParticles = [];
        this.zeroGravityOverlay = null;
        this.originalPlayerGravity = 0;
    }

    setCharacterScale(){
        // Scale different characters to be similar sizes in-game
        switch(this.characterKey) {
            case 'dude':
                this.setScale(1); // Normal size (32x48)
                break;
            case 'cat':
                // Cat is 542x474, scale down and adjust for better centering
                this.setScale(0.12); // Increased from 0.08 to make larger
                break;
            case 'robot':
                // Robot is 542x474, scale down and adjust for better centering
                this.setScale(0.12); // Increased from 0.08 to make larger
                break;
            default:
                this.setScale(1);
        }
    }

    initAnimations(){
    // Try to create animations, but handle cases where sprites might not be proper spritesheets
    try {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(this.characterKey, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: this.characterKey, frame: 4 } ],
            frameRate: 1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(this.characterKey, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    } catch (error) {
        // Fallback: create simple animations using just the first frame if it's not a full spritesheet
        console.warn(`Character ${this.characterKey} may not be a proper spritesheet, using fallback animations`);
        try {
            this.anims.create({
                key: 'left',
                frames: [ { key: this.characterKey, frame: 0 } ],
                frameRate: 1
            });

            this.anims.create({
                key: 'turn',
                frames: [ { key: this.characterKey, frame: 0 } ],
                frameRate: 1
            });

            this.anims.create({
                key: 'right',
                frames: [ { key: this.characterKey, frame: 0 } ],
                frameRate: 1
            });
        } catch (fallbackError) {
            console.error(`Failed to create animations for ${this.characterKey}:`, fallbackError);
        }
    }
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
        case 4: return this.speedTier4;
        case 5: return this.speedTier5;
        default: return this.baseMovementSpeed;
    }
}

jump(){
    console.log('Jump called - jumpRank:', this.abilityRanks.jump, 'maxJumps:', this.getMaxJumps(), 'jumpsRemaining:', this.jumpsRemaining, 'onGround:', this.body.blocked.down);
    
    if (this.body.blocked.down) {
        // Ground jump - always available
        this.setVelocityY(-520);
        this.jumpsRemaining = this.getMaxJumps() - 1; // Set remaining jumps after ground jump
        console.log('Ground jump executed, jumpsRemaining set to:', this.jumpsRemaining);
    } else if (this.jumpsRemaining > 0) {
        // Air jumps based on jump rank
        const maxJumps = this.getMaxJumps();
        
        // Calculate which air jump this is (1st air jump, 2nd air jump, etc.)
        const currentAirJump = maxJumps - this.jumpsRemaining; // 1st air jump = 1, 2nd air jump = 2, etc.
        
        console.log('Attempting air jump - currentAirJump:', currentAirJump, 'jumpRank:', this.abilityRanks.jump);
        
        // Jump velocities decrease with each subsequent jump
        const jumpVelocities = [-520, -480, -440, -400, -360]; // Air jump strengths
        const jumpColors = [0x00ffff, 0xffff00, 0xff00ff, 0x00ff00, 0xff8800]; // Visual effects
        
        // Check if this air jump is unlocked (rank 1 = 1 air jump, rank 2 = 2 air jumps, etc.)
        if (currentAirJump <= 5 && this.abilityRanks.jump >= currentAirJump) {
            this.setVelocityY(jumpVelocities[currentAirJump - 1]);
            
            // Visual effect
            this.setTint(jumpColors[currentAirJump - 1]);
            this.gameScene.time.delayedCall(100 + currentAirJump * 20, () => {
                this.setTint(0xffffff); // Reset to normal
            });
            
            console.log('Air jump executed with velocity:', jumpVelocities[currentAirJump - 1]);
        } else {
            // Jump not unlocked yet
            console.log('Air jump not unlocked - need rank', currentAirJump, 'but have rank', this.abilityRanks.jump);
            return; // Don't consume jump
        }

        this.jumpsRemaining--;
        console.log('Air jump consumed, jumpsRemaining now:', this.jumpsRemaining);
    } else {
        console.log('No jumps remaining');
    }
}

fastFall(){
    // Only allow fast fall when unlocked and in the air and falling (positive Y velocity)
    if (this.abilityRanks.fastFall >= 1 && !this.body.blocked.down && this.body.velocity.y > 0) {
        const fastFallSpeeds = [0, 800, 900, 1000, 1100, 1200]; // Tier 1-5 fast fall speeds
        const fastFallSpeed = fastFallSpeeds[this.abilityRanks.fastFall] || 800;
        this.setVelocityY(fastFallSpeed);
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
        if (nextRank === 4) return 'Penta Jump';
        if (nextRank === 5) return 'Hexa Jump';
        return 'Jump MAX'; // Fallback or max rank
    }

getStarMagnetUpgradeName() {
        const currentRank = this.abilityRanks.starMagnet;
        const tierNames = ['Star Magnet I', 'Star Magnet II', 'Star Magnet III', 'Star Magnet IV', 'Star Magnet V'];
        if (currentRank >= 5) return 'Star Magnet MAX';
        return tierNames[currentRank] || 'Star Magnet I';
    }

getSlowBombsUpgradeName() {
        const currentRank = this.abilityRanks.slowBombs;
        const tierNames = ['Slow Bombs I', 'Slow Bombs II', 'Slow Bombs III', 'Slow Bombs IV', 'Slow Bombs V'];
        if (currentRank >= 5) return 'Slow Bombs MAX';
        return tierNames[currentRank] || 'Slow Bombs I';
    }

getSpeedUpgradeName() {
        const nextRank = this.abilityRanks.speed + 1;
        if (nextRank === 1) return 'Super Speed I';
        if (nextRank === 2) return 'Super Speed II';
        if (nextRank === 3) return 'Super Speed III';
        if (nextRank === 4) return 'Super Speed IV';
        if (nextRank === 5) return 'Super Speed V';
        return 'Super Speed MAX'; // Fallback or max rank
    }    getPlatformDropUpgradeName() {
        const nextRank = this.abilityRanks.platformDrop + 1;
        if (nextRank === 1) return 'Platform Jump';
        if (nextRank === 2) return 'Platform Drop';
        if (nextRank === 3) return 'Platform Drop All';
        return 'Platform Drop MAX';
    }    getExtraLifeUpgradeName() {
        return 'Extra Life'; // Always shows the same name, no "MAX"
    }

    getStarMultiplierUpgradeName() {
        const nextRank = this.abilityRanks.starMultiplier + 1;
        if (nextRank === 1) return 'Star Value +12';
        if (nextRank === 2) return 'Star Value +15';
        if (nextRank === 3) return 'Star Value +18';
        return 'Star Value MAX';
    }

    getTokenBonusUpgradeName() {
        const nextRank = this.abilityRanks.tokenBonus + 1;
        if (nextRank === 1) return 'Token Bonus +2';
        if (nextRank === 2) return 'Token Bonus +3';
        if (nextRank === 3) return 'Token Bonus +4';
        return 'Token Bonus MAX';
    }

    getSonicBoomUpgradeName() {
        const nextRank = this.abilityRanks.sonicBoom + 1;
        if (nextRank === 1) return 'Sonic Boom I';
        if (nextRank === 2) return 'Sonic Boom II';
        if (nextRank === 3) return 'Sonic Boom III';
        return 'Sonic Boom MAX';
    }

    getBarrierUpgradeName() {
        const nextRank = this.abilityRanks.barrier + 1;
        if (nextRank === 1) return 'Barrier I';
        if (nextRank === 2) return 'Barrier II';
        if (nextRank === 3) return 'Barrier III';
        return 'Barrier MAX';
    }

    getLifeRegenUpgradeName() {
        const nextRank = this.abilityRanks.lifeRegen + 1;
        if (nextRank === 1) return 'Life Regen I';
        if (nextRank === 2) return 'Life Regen II';
        if (nextRank === 3) return 'Life Regen III';
        if (nextRank === 4) return 'Life Regen IV';
        if (nextRank === 5) return 'Life Regen V';
        return 'Life Regen MAX';
    }

getMaxJumps() {
    if (this.abilityRanks.jump >= 5) return 6; // Hexa jump
    if (this.abilityRanks.jump >= 4) return 5; // Penta jump
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
        jump: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }, { tokens: 5, specialTokens: 0 }],
        speed: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }, { tokens: 5, specialTokens: 0 }],
        fastFall: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }, { tokens: 5, specialTokens: 0 }],
        barrier: [{ tokens: 0, specialTokens: 1 }, { tokens: 5, specialTokens: 0 }, { tokens: 10, specialTokens: 0 }],
        slowBombs: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }, { tokens: 5, specialTokens: 0 }],
        starMagnet: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }, { tokens: 5, specialTokens: 0 }],
        emp: [{ tokens: 0, specialTokens: 1 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 1 }],
        platformDrop: [{ tokens: 0, specialTokens: 1 }, { tokens: 5, specialTokens: 0 }, { tokens: 10, specialTokens: 0 }],
        tokenBonus: [{ tokens: 0, specialTokens: 1 }, { tokens: 5, specialTokens: 0 }, { tokens: 10, specialTokens: 0 }],
        starMultiplier: [{ tokens: 4, specialTokens: 0 }, { tokens: 5, specialTokens: 0 }, { tokens: 7, specialTokens: 0 }],
        sonicBoom: [{ tokens: 0, specialTokens: 1 }, { tokens: 10, specialTokens: 0 }, { tokens: 15, specialTokens: 0 }],
        lifeRegen: [{ tokens: 1, specialTokens: 0 }, { tokens: 2, specialTokens: 0 }, { tokens: 3, specialTokens: 0 }, { tokens: 4, specialTokens: 0 }, { tokens: 5, specialTokens: 0 }],
        extraLife: [] // Will be handled by default return
    };
    
    // Special handling for extraLife - cost increases by 1 token each time
    if (abilityName === 'extraLife') {
        // Cost is 5 tokens for the first, then +1 for each additional purchase
        return { tokens: 5 + (currentRank || 0), specialTokens: 0 };
    }
    
    return costs[abilityName][currentRank] || { tokens: 0, specialTokens: 0 };
}

getMaxRank(abilityName) {
    const maxRanks = {
        jump: 5, speed: 5, fastFall: 5, barrier: 3,
        slowBombs: 5, starMagnet: 5, emp: 3, platformDrop: 3, tokenBonus: 3, starMultiplier: 3, extraLife: 999, sonicBoom: 3, lifeRegen: 5
    };
    return maxRanks[abilityName] || 1;
}

requiresSpecialToken(abilityName, currentRank) {
    if (abilityName === 'barrier' && currentRank === 0) {
        return true; // Only first barrier upgrade requires special token
    }
    if (abilityName === 'emp' && currentRank === 0) {
        return true; // Only first EMP upgrade requires special token
    }
    if (abilityName === 'platformDrop' && currentRank === 0) {
        return true; // Only first platform drop upgrade requires special token
    }
    if (abilityName === 'tokenBonus' && currentRank === 0) {
        return true; // Only first token bonus upgrade requires special token
    }
    if (abilityName === 'sonicBoom' && currentRank === 0) {
        return true; // Only first sonic boom upgrade requires special token
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
    
    // Special handling for extra life - add a life to the game
    if (abilityName === 'extraLife') {
        if (this.gameScene && this.gameScene.lives !== undefined) {
            this.gameScene.lives++;
            if (this.gameScene.livesText) {
                this.gameScene.livesText.setText('Lives: ' + this.gameScene.lives);
            }
        }
    }
    
    // Special handling for sonic boom - add charges when upgraded
    if (abilityName === 'sonicBoom') {
        this.addSonicBoomCharges();
    }
    
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
    this.sonicBoomUnlocked = this.abilityRanks.sonicBoom >= 1;
    this.lifeRegenUnlocked = this.abilityRanks.lifeRegen >= 1;
    this.zeroGravityUnlocked = this.abilityRanks.zeroGravity >= 1;
    this.platformJumpUnlocked = this.abilityRanks.platformDrop >= 1; // Jump through platforms from below
    this.platformDropUnlocked = this.abilityRanks.platformDrop >= 2; // Drop through platforms with down key
    this.platformDropAllUnlocked = this.abilityRanks.platformDrop >= 3; // Drop through ground and tall walls
    
    // Update barrier properties based on rank
    if (this.abilityRanks.barrier >= 2) {
        this.barrierDuration = 6000; // Nerfed: Tier 2: 6 seconds duration (reduced from 7)
        this.barrierCooldown = 10000; // Tier 2: 10 seconds cooldown (faster)
    }
    if (this.abilityRanks.barrier >= 3) {
        this.barrierDuration = 8000; // Nerfed: Tier 3: 8 seconds duration (reduced from 10)
        this.barrierCooldown = 8000; // Tier 3: 8 seconds cooldown (fastest)
    }
    
    // Update EMP properties based on rank
    if (this.abilityRanks.emp >= 2) {
        this.starPointsNeededForEMP = 550; // Nerfed: Tier 2 - needs fewer star points (increased from 450)
    }
    if (this.abilityRanks.emp >= 3) {
        this.starPointsNeededForEMP = 500; // Nerfed: Tier 3 - even fewer star points needed (increased from 400)
    }
    
    // Update life regen properties based on rank
    if (this.abilityRanks.lifeRegen >= 1) {
        this.lifeRegenPointsNeededForLife = Math.max(250, 375 - ((this.abilityRanks.lifeRegen - 1) * 25)); // Ensure minimum of 250 points needed
    }
    
    // Update Zero Gravity properties based on rank
    if (this.abilityRanks.zeroGravity >= 1) {
        // Reduce star points needed every 3 levels: 250 -> 225 -> 200
        const reductions = Math.floor((this.abilityRanks.zeroGravity - 1) / 3);
        this.zeroGravityStarPointsNeeded = Math.max(200, 250 - (reductions * 25));
        this.zeroGravityAvailable = true; // Start with first charge available
    }
}

// Activate barrier ability
activateBarrier() {
    if (this.abilityRanks.barrier < 1 || this.barrierActive || this.barrierCharge < 100) {
        return false; // Can't activate
    }
    
    this.barrierActive = true;
    this.barrierCharge = 0; // Use up all charge
    this.barrierPointsCollected = 0; // Reset star points counter
    
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

// Check if barrier makes player invincible
isInvincible() {
    return this.barrierActive;
}

// Update method to reset jumps when touching ground
update() {
    // Check if player just landed on the ground
    if (this.body.blocked.down && !this.wasOnGround) {
        this.jumpsRemaining = this.getMaxJumps(); // Reset jumps when landing
    }
    
    // Track ground state for next frame
    this.wasOnGround = this.body.blocked.down;
    
    // Recharge barrier over time - REMOVED: Now charges with star points instead
    // Barrier now charges based on star points collected, not time
    
    // Update barrier visual effect if active
    if (this.barrierActive) {
        this.updateBarrierEffect();
    }
}

    // Get the bomb slow factor based on upgrade level (permanent stat)
    getBombSlowFactor() {
        const slowLevels = [1.0, 0.85, 0.70, 0.55, 0.40, 0.25]; // Nerfed: bombs are less slow now
        return slowLevels[this.abilityRanks.slowBombs] || 1.0;
    }

    getStarScoreValue() {
        const scoreValues = [9, 11, 13, 15]; // Nerfed: reduced from [9, 12, 15, 18]
        return scoreValues[this.abilityRanks.starMultiplier] || 9;
    }

    getBonusTokensPerLevel() {
        const bonusTokens = [0, 2, 3, 4]; // 0=no bonus, 1=+2 tokens, 2=+3 tokens, 3=+4 tokens
        return bonusTokens[this.abilityRanks.tokenBonus] || 0;
    }

// Get barrier charge information for UI display
getBarrierChargePercentage() {
        return this.barrierCharge;
    }
    
    // Get barrier charge progress (points collected toward next charge)
    getBarrierChargeProgress() {
        return {
            current: this.barrierPointsCollected,
            needed: this.barrierPointsNeededForCharge,
            percentage: this.barrierCharge
        };
    }
    
    // Check if barrier is ready to use
    isBarrierReady() {
        return this.barrierUnlocked && this.barrierCharge >= 100 && !this.barrierActive;
    }

    // Get Zero Gravity recharge progress for UI display
    getZeroGravityRechargeProgress() {
        if (!this.zeroGravityUnlocked) return { current: 0, needed: 250, percentage: 0 };
        if (this.zeroGravityAvailable || this.zeroGravityActive) return { current: this.zeroGravityStarPointsNeeded, needed: this.zeroGravityStarPointsNeeded, percentage: 100 };
        
        return {
            current: this.zeroGravityStarPointsCollected,
            needed: this.zeroGravityStarPointsNeeded,
            percentage: (this.zeroGravityStarPointsCollected / this.zeroGravityStarPointsNeeded) * 100
        };
    }
    
    // Check if Zero Gravity is ready to use
    isZeroGravityReady() {
        return this.zeroGravityUnlocked && this.zeroGravityAvailable && !this.zeroGravityActive;
    }

    // Get life regen charge progress for UI display
    getLifeRegenProgress() {
        if (!this.lifeRegenUnlocked) return { current: 0, needed: 375, percentage: 0 };
        
        // Ensure we have a valid needed value to prevent division by zero
        const needed = Math.max(250, this.lifeRegenPointsNeededForLife);
        const current = Math.max(0, this.lifeRegenPointsCollected);
        
        return {
            current: current,
            needed: needed,
            percentage: needed > 0 ? (current / needed) * 100 : 0
        };
    }

// Apply magnetic effect to stars (Star Magnet ability)
applyStarMagnet(stars) {
    if (this.abilityRanks.starMagnet < 1) return;
    
    // Nerfed: reduced ranges and forces
    const magnetRanges = [0, 80, 100, 130, 170, 220]; // Reduced from [0, 100, 135, 175, 225, 300]
    const magnetForces = [0, 150, 180, 220, 280, 350]; // Reduced attraction force
    
    const magnetRange = magnetRanges[this.abilityRanks.starMagnet] || 80;
    const magnetForce = magnetForces[this.abilityRanks.starMagnet] || 150;
    
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
collectStar(starPoints = 9) {
        this.starPointsCollected += starPoints;
        if (this.empUnlocked && this.starPointsCollected >= this.starPointsNeededForEMP && !this.empAvailable) {
            this.empAvailable = true;
            this.starPointsCollected = 0; // Reset counter
        }
        
        // Charge barrier with star points
        if (this.barrierUnlocked && !this.barrierActive && this.barrierCharge < this.barrierMaxCharge) {
            this.barrierPointsCollected += starPoints;
            if (this.barrierPointsCollected >= this.barrierPointsNeededForCharge) {
                this.barrierCharge = this.barrierMaxCharge; // Fully charge barrier
                this.barrierPointsCollected = 0; // Reset counter
            } else {
                // Update charge percentage based on points collected
                this.barrierCharge = (this.barrierPointsCollected / this.barrierPointsNeededForCharge) * this.barrierMaxCharge;
            }
        }
        
        // Charge Zero Gravity with star points
        if (this.zeroGravityUnlocked && !this.zeroGravityAvailable && !this.zeroGravityActive) {
            this.zeroGravityStarPointsCollected += starPoints;
            if (this.zeroGravityStarPointsCollected >= this.zeroGravityStarPointsNeeded) {
                this.zeroGravityAvailable = true;
                this.zeroGravityStarPointsCollected = 0; // Reset counter
                
                // Show notification that Zero Gravity is ready
                const readyText = this.gameScene.add.text(this.gameScene.cameras.main.centerX, 160, 'ZERO GRAVITY READY!', {
                    fontFamily: 'Arial Black',
                    fontSize: 28,
                    color: '#88aaff',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5);
                
                this.gameScene.tweens.add({
                    targets: readyText,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Power2',
                    onComplete: () => {
                        readyText.destroy();
                    }
                });
            }
        }
        
        // Life regen system - regenerate lives based on star points
        if (this.lifeRegenUnlocked) {
            this.lifeRegenPointsCollected += starPoints;
            
            // Ensure we have a valid threshold to prevent infinite regeneration
            const pointsNeeded = Math.max(250, this.lifeRegenPointsNeededForLife);
            
            if (this.lifeRegenPointsCollected >= pointsNeeded) {
                // Grant a new life
                if (this.gameScene && this.gameScene.lives !== undefined) {
                    this.gameScene.lives++;
                    if (this.gameScene.livesText) {
                        this.gameScene.livesText.setText('Lives: ' + this.gameScene.lives);
                    }
                    
                    // Show life regen notification
                    const lifeRegenText = this.gameScene.add.text(this.gameScene.cameras.main.centerX, 190, 'LIFE REGENERATED!', {
                        fontFamily: 'Arial Black',
                        fontSize: 32,
                        color: '#00ff00',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setOrigin(0.5);
                    
                    this.gameScene.tweens.add({
                        targets: lifeRegenText,
                        alpha: 0,
                        duration: 2000,
                        ease: 'Power2',
                        onComplete: () => {
                            lifeRegenText.destroy();
                        }
                    });
                }
                
                // Reset points counter
                this.lifeRegenPointsCollected = 0;
            }
        }
    }
    
    // Activate EMP ability
    activateEMP(bombs) {
        if (!this.empUnlocked || !this.empAvailable || this.empActive) {
            return false; // Can't activate
        }
        
        // Find all active bombs and store their properties
        const activeBombs = [];
        bombs.children.entries.forEach(bomb => {
            if (bomb.active) {
                activeBombs.push({
                    x: bomb.x,
                    y: bomb.y,
                    velocityX: bomb.body.velocity.x,
                    velocityY: bomb.body.velocity.y
                });
            }
        });
        
        if (activeBombs.length > 0) {
            // Set EMP as active
            this.empActive = true;
            
            // Create dramatic EMP effect at player position
            this.createEMPEffect(activeBombs.length);
            
            // Destroy all bombs immediately - use multiple methods for thoroughness
            bombs.clear(true, true); // Clear all bombs from the group and destroy them
            
            // Also manually destroy any remaining bombs just in case
            bombs.children.entries.forEach(bomb => {
                if (bomb && bomb.active) {
                    bomb.destroy();
                }
            });
            
            // Double-check: remove any bombs that might still exist
            this.gameScene.children.list.forEach(child => {
                if (child.texture && child.texture.key === 'bomb') {
                    child.destroy();
                }
            });
            
            // Determine delay based on EMP tier
            let delay = this.empDelayTier1; // Default 8 seconds
            if (this.abilityRanks.emp >= 3) {
                delay = this.empDelayTier3; // 4 seconds
            } else if (this.abilityRanks.emp >= 2) {
                delay = this.empDelayTier2; // 6 seconds
            }
            
            // Return bombs after delay
            this.gameScene.time.delayedCall(delay, () => {
                this.returnBombs(activeBombs);
                this.empActive = false;
            });
            
            // Use up the EMP
            this.empAvailable = false;
            this.starsCollected = 0;
            
            return true;
        }
        
        return false;
    }
    
    // Return bombs to the game after EMP delay
    returnBombs(bombData) {
        bombData.forEach(bombInfo => {
            // Create new bomb at stored position
            const bomb = this.gameScene.bombs.create(bombInfo.x, bombInfo.y, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.body.bounce.setTo(1, 1);
            bomb.body.friction.setTo(0, 0);
            bomb.body.drag.setTo(0, 0);
            
            // Restore velocity (or give random velocity if original was too slow)
            const minSpeed = 100;
            let vx = bombInfo.velocityX;
            let vy = bombInfo.velocityY;
            
            // Ensure minimum speed
            if (Math.abs(vx) < minSpeed) {
                vx = vx >= 0 ? minSpeed : -minSpeed;
            }
            if (Math.abs(vy) < minSpeed) {
                vy = vy >= 0 ? minSpeed : -minSpeed;
            }
            
            bomb.setVelocity(vx, vy);
        });
        
        // Show "Bombs Restored!" message with count
        const warningText = this.gameScene.add.text(725, 400, `${bombData.length} BOMBS RESTORED!`, {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.gameScene.tweens.add({
            targets: warningText,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                warningText.destroy();
            }
        });
    }
    
    // Create EMP explosion visual effect
    createEMPEffect(bombCount = 0) {
        // Create electric explosion effect centered on player
        const empGraphics = this.gameScene.add.graphics();
        
        // Create expanding electric rings from player position
        for (let i = 0; i < 8; i++) {
            this.gameScene.time.delayedCall(i * 100, () => {
                empGraphics.clear();
                
                // Outer ring
                empGraphics.lineStyle(6, 0x00ffff, 1 - (i * 0.12));
                empGraphics.strokeCircle(this.x, this.y, 50 + (i * 80));
                
                // Inner ring
                empGraphics.lineStyle(8, 0xffffff, 1 - (i * 0.12));
                empGraphics.strokeCircle(this.x, this.y, 30 + (i * 60));
                
                // Lightning effect
                if (i < 4) {
                    empGraphics.lineStyle(4, 0xffff00, 1 - (i * 0.25));
                    empGraphics.beginPath();
                    for (let j = 0; j < 8; j++) {
                        const angle = (j * Math.PI * 2) / 8;
                        const radius = 40 + (i * 50);
                        const x = this.x + Math.cos(angle) * radius;
                        const y = this.y + Math.sin(angle) * radius;
                        empGraphics.lineTo(x, y);
                    }
                    empGraphics.closePath();
                    empGraphics.strokePath();
                }
            });
        }
        
        // Screen shake effect - more intense
        this.gameScene.cameras.main.shake(500, 0.03);
        
        // Show "EMP ACTIVATED!" message with bomb count
        const empText = this.gameScene.add.text(this.x, this.y - 60, `EMP ACTIVATED!\n${bombCount} BOMBS DESTROYED!`, {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        
        this.gameScene.tweens.add({
            targets: empText,
            y: this.y - 100,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                empText.destroy();
            }
        });
        
        // Clean up after animation
        this.gameScene.time.delayedCall(1000, () => {
            if (empGraphics) {
                empGraphics.destroy();
            }
        });
    }

    // Activate Sonic Boom ability
    activateSonicBoom(bombs) {
        if (!this.sonicBoomUnlocked || this.sonicBoomAvailable <= 0) {
            return false; // Can't activate
        }
        
        // Determine how many bombs to destroy based on tier
        let bombsToDestroy = 1; // Tier 1
        if (this.abilityRanks.sonicBoom >= 3) {
            bombsToDestroy = 3; // Tier 3
        } else if (this.abilityRanks.sonicBoom >= 2) {
            bombsToDestroy = 2; // Tier 2
        }
        
        // Find active bombs and select closest ones to destroy
        const activeBombs = [];
        bombs.children.entries.forEach(bomb => {
            if (bomb.active) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, bomb.x, bomb.y);
                activeBombs.push({ bomb: bomb, distance: distance });
            }
        });
        
        if (activeBombs.length === 0) {
            return false; // No bombs to destroy
        }
        
        // Sort by distance and take the closest ones
        activeBombs.sort((a, b) => a.distance - b.distance);
        const bombsDestroyed = Math.min(bombsToDestroy, activeBombs.length);
        
        // Create pulse grenade effect at player position
        this.createSonicBoomEffect(bombsDestroyed);
        
        // Destroy the closest bombs with visual effects
        for (let i = 0; i < bombsDestroyed; i++) {
            const bombToDestroy = activeBombs[i].bomb;
            
            // Create explosion effect at bomb position
            this.createBombDestructionEffect(bombToDestroy.x, bombToDestroy.y);
            
            // Destroy the bomb
            bombToDestroy.destroy();
        }
        
        // Use up one sonic boom charge
        this.sonicBoomAvailable--;
        
        return true;
    }
    
    // Create Sonic Boom pulse grenade visual effect
    createSonicBoomEffect(bombsDestroyed) {
        // Create pulse wave effect centered on player
        const pulseGraphics = this.gameScene.add.graphics();
        
        // Create expanding pulse rings from player position
        for (let i = 0; i < 6; i++) {
            this.gameScene.time.delayedCall(i * 80, () => {
                pulseGraphics.clear();
                
                // Outer pulse ring
                pulseGraphics.lineStyle(8, 0xff6600, 1 - (i * 0.15));
                pulseGraphics.strokeCircle(this.x, this.y, 40 + (i * 60));
                
                // Inner pulse ring
                pulseGraphics.lineStyle(12, 0xffaa00, 1 - (i * 0.15));
                pulseGraphics.strokeCircle(this.x, this.y, 25 + (i * 40));
                
                // Core pulse
                if (i < 3) {
                    pulseGraphics.lineStyle(6, 0xffffff, 1 - (i * 0.3));
                    pulseGraphics.strokeCircle(this.x, this.y, 15 + (i * 20));
                }
            });
        }
        
        // Screen shake effect
        this.gameScene.cameras.main.shake(300, 0.02);
        
        // Show "SONIC BOOM!" message
        const boomText = this.gameScene.add.text(this.x, this.y - 50, `SONIC BOOM!\n${bombsDestroyed} BOMBS DESTROYED!`, {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        
        this.gameScene.tweens.add({
            targets: boomText,
            y: this.y - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
                boomText.destroy();
            }
        });
        
        // Clean up after animation
        this.gameScene.time.delayedCall(800, () => {
            if (pulseGraphics) {
                pulseGraphics.destroy();
            }
        });
    }
    
    // Create bomb destruction visual effect
    createBombDestructionEffect(x, y) {
        const explosionGraphics = this.gameScene.add.graphics();
        
        // Create small explosion effect at bomb position
        for (let i = 0; i < 4; i++) {
            this.gameScene.time.delayedCall(i * 50, () => {
                explosionGraphics.clear();
                
                // Orange explosion burst
                explosionGraphics.fillStyle(0xff6600, 1 - (i * 0.25));
                explosionGraphics.fillCircle(x, y, 20 + (i * 10));
                
                // Yellow inner burst
                explosionGraphics.fillStyle(0xffaa00, 1 - (i * 0.25));
                explosionGraphics.fillCircle(x, y, 15 + (i * 8));
                
                // White core
                explosionGraphics.fillStyle(0xffffff, 1 - (i * 0.3));
                explosionGraphics.fillCircle(x, y, 8 + (i * 5));
            });
        }
        
        // Clean up explosion effect
        this.gameScene.time.delayedCall(300, () => {
            if (explosionGraphics) {
                explosionGraphics.destroy();
            }
        });
    }
    
    // Get available sonic boom charges (for UI display)
    getSonicBoomCharges() {
        return this.sonicBoomAvailable;
    }
    
    // Add sonic boom charges when upgrading
    addSonicBoomCharges() {
        if (this.abilityRanks.sonicBoom >= 1) {
            this.sonicBoomAvailable += 1; // Add 1 charge when upgraded
        }
    }

    // Charge Sonic Boom based on points collected
    chargeSonicBoom(points) {
        if (!this.sonicBoomUnlocked) return;
        
        this.sonicBoomPointsCollected += points;
        
        // Check if we've earned a new charge
        while (this.sonicBoomPointsCollected >= this.sonicBoomPointsNeededForCharge) {
            this.sonicBoomPointsCollected -= this.sonicBoomPointsNeededForCharge;
            this.sonicBoomAvailable += 1;
        }
    }

    // Activate barrier ability
    activateBarrier() {
        if (this.abilityRanks.barrier < 1 || this.barrierActive || this.barrierCharge < 100) {
            return false; // Can't activate
        }
        
        this.barrierActive = true;
        this.barrierCharge = 0; // Use up all charge
        this.barrierPointsCollected = 0; // Reset star points counter
        
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

    // Update method to reset jumps when touching ground
    update() {
        // Check if player just landed on the ground
        if (this.body.blocked.down && !this.wasOnGround) {
            this.jumpsRemaining = this.getMaxJumps(); // Reset jumps when landing
        }
        
        // Track ground state for next frame
        this.wasOnGround = this.body.blocked.down;
        
        // Recharge barrier over time - REMOVED: Now charges with star points instead
        // Barrier now charges based on star points collected, not time
        
        // Update barrier visual effect if active
        if (this.barrierActive) {
            this.updateBarrierEffect();
        }
    }

    // Zero Gravity ability activation
    activateZeroGravity(bombs, stars) {
        // Check if Zero Gravity is unlocked and available
        if (!this.zeroGravityUnlocked || !this.zeroGravityAvailable || this.zeroGravityActive) {
            return false;
        }
        
        console.log('Zero Gravity activated by player - MOON GRAVITY!');
        
        // Set zero gravity state
        this.zeroGravityActive = true;
        this.zeroGravityAvailable = false;
        
        // Store original gravity values for restoration
        this.originalPlayerGravity = this.body.gravity.y;
        
        // Get current rank for scaling effects
        const rank = this.abilityRanks.zeroGravity || 1;
        
        // Moon-like gravity effect - almost floating bombs
        if (bombs && bombs.children) {
            bombs.children.entries.forEach(bomb => {
                if (bomb.active) {
                    // Much lighter anti-gravity - bombs almost float but don't rise
                    bomb.body.setGravityY(-400 + (rank - 1) * -50); // Very light anti-gravity - almost floating
                    // Slow down bombs significantly for moon-like movement
                    bomb.setVelocity(bomb.body.velocity.x * 0.4, bomb.body.velocity.y * 0.4);
                    bomb.setDrag(0); // No air resistance
                    bomb.setBounce(1.0); // Full bounciness - bounces normally but slower falls
                }
            });
        }
        
        if (stars && stars.children) {
            stars.children.entries.forEach(star => {
                if (star.active) {
                    star.body.setGravityY(-100 - (rank - 1) * 30); // Gentle anti-gravity for stars
                    // Make stars move slower
                    star.setVelocity(star.body.velocity.x * 0.3, star.body.velocity.y * 0.3);
                    star.setDrag(15); // Light air resistance
                    star.setBounce(0.3); // Gentle bouncing
                    
                    // Gentle upward drift
                    const upwardForce = Phaser.Math.Between(-15, -5);
                    star.setVelocityY(star.body.velocity.y + upwardForce);
                }
            });
        }
        
        // Apply no gravity change to player - player moves normally
        // this.body.setGravityY(-600); // REMOVED - no gravity change for player
        // this.body.setDrag(0); // REMOVED - no drag change for player
        
        // No initial velocity changes - player movement unaffected
        // Player moves completely normally during zero gravity

        // Enhanced star magnet effect during zero gravity
        this.zeroGravityStarMagnetBonus = true;
        
        // Gentler continuous zero gravity effects
        this.zeroGravityEffectTimer = this.gameScene.time.addEvent({
            delay: 150, // Every 150ms for gentler effect
            callback: () => {
                // Apply gentle anti-gravity to all objects
                if (bombs && bombs.children) {
                    bombs.children.entries.forEach(bomb => {
                        if (bomb.active) {
                            // No drift forces needed - let natural moon gravity work
                            // Bombs will bounce normally but fall much slower
                            
                            // Normal velocity limits - unrestricted bouncing
                            const maxVel = 600;
                            if (Math.abs(bomb.body.velocity.x) > maxVel) {
                                bomb.setVelocityX(bomb.body.velocity.x > 0 ? maxVel : -maxVel);
                            }
                            if (bomb.body.velocity.y > maxVel) {
                                bomb.setVelocityY(maxVel);
                            }
                        }
                    });
                }
                
                if (stars && stars.children) {
                    stars.children.entries.forEach(star => {
                        if (star.active) {
                            // Gentle upward drift
                            const driftY = Phaser.Math.Between(-6, -2);
                            star.setVelocityY(star.body.velocity.y + driftY);
                            
                            // Normal movement limits
                            const maxVel = 80;
                            if (Math.abs(star.body.velocity.x) > maxVel) {
                                star.setVelocityX(star.body.velocity.x > 0 ? maxVel : -maxVel);
                            }
                            if (star.body.velocity.y > maxVel) {
                                star.setVelocityY(maxVel);
                            }
                            
                            // Add gentle upward force
                            star.setVelocityY(star.body.velocity.y - 1);
                        }
                    });
                }
                
                // Keep player floating extremely gently
                if (this.body.velocity.y > 250) {
                    this.setVelocityY(250); // Higher falling speed cap for player
                }
                
                // Very minimal upward force to player
                this.setVelocityY(this.body.velocity.y - 0.1);
            },
            loop: true
        });
        
        // Enhanced star magnet effect - not ultra massive
        if (stars && stars.children) {
            stars.children.entries.forEach(star => {
                if (star.active) {
                    const distance = Phaser.Math.Distance.Between(this.x, this.y, star.x, star.y);
                    const maxDistance = 400; // Reasonable range
                    
                    if (distance < maxDistance) {
                        const force = Math.max(1.0, (maxDistance - distance) / maxDistance) * 15; // Moderate force
                        const angle = Phaser.Math.Angle.Between(star.x, star.y, this.x, this.y);
                        
                        const forceX = Math.cos(angle) * force;
                        const forceY = Math.sin(angle) * force;
                        
                        star.setVelocity(star.body.velocity.x + forceX, star.body.velocity.y + forceY);
                    }
                }
            });
        }
        
        // Visual effects - simplified approach without post pipelines
        this.zeroGravityOverlay = this.gameScene.add.rectangle(
            this.gameScene.cameras.main.centerX,
            this.gameScene.cameras.main.centerY,
            this.gameScene.cameras.main.width,
            this.gameScene.cameras.main.height,
            0x6666ff,
            0.1
        );
        this.zeroGravityOverlay.setScrollFactor(0);
        this.zeroGravityOverlay.setDepth(999);
        
        // Pulsing effect for the overlay
        this.gameScene.tweens.add({
            targets: this.zeroGravityOverlay,
            alpha: 0.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create floating particle effect
        this.createZeroGravityParticles();
        
        // Shorter duration - moon gravity periods
        const duration = 12000 + (rank - 1) * 3000; // 12s base + 3s per rank (up to 18s at max rank)
        
        // Schedule deactivation
        this.gameScene.time.delayedCall(duration, () => {
            this.deactivateZeroGravity(bombs, stars);
        });
        
        return true;
    }
    
    createZeroGravityParticles() {
        // Create floating particle effect to show zero gravity is active
        if (!this.zeroGravityParticles) {
            this.zeroGravityParticles = [];
        }
        
        // Create 15 floating particles
        for (let i = 0; i < 15; i++) {
            const particle = this.gameScene.add.circle(
                Phaser.Math.Between(0, 1450),
                Phaser.Math.Between(200, 950),
                Phaser.Math.Between(2, 5),
                0x88aaff,
                0.5
            );
            
            this.gameScene.physics.add.existing(particle);
            particle.body.setGravityY(-300);
            particle.body.setVelocity(
                Phaser.Math.Between(-15, 15),
                Phaser.Math.Between(-25, -10)
            );
            
            this.zeroGravityParticles.push(particle);
        }
    }

    deactivateZeroGravity(bombs, stars) {
        console.log('Zero Gravity deactivated - returning to normal gravity');
        
        this.zeroGravityActive = false;
        this.zeroGravityStarMagnetBonus = false;
        
        // Stop the continuous effect timer
        if (this.zeroGravityEffectTimer) {
            this.zeroGravityEffectTimer.remove();
            this.zeroGravityEffectTimer = null;
        }
        
        // Remove floating particles
        if (this.zeroGravityParticles) {
            this.zeroGravityParticles.forEach(particle => {
                if (particle && particle.destroy) {
                    particle.destroy();
                }
            });
            this.zeroGravityParticles = [];
        }
        
        // Remove visual overlay effect
        if (this.zeroGravityOverlay) {
            this.gameScene.tweens.killTweensOf(this.zeroGravityOverlay);
            this.zeroGravityOverlay.destroy();
            this.zeroGravityOverlay = null;
        }
        
        // Restore normal gravity and physics for all objects
        if (bombs && bombs.children) {
            bombs.children.entries.forEach(bomb => {
                if (bomb.active) {
                    bomb.body.setGravityY(0); // Reset to normal
                    bomb.setDrag(0); // Remove air resistance
                    bomb.setBounce(1); // Restore full bounciness
                    
                    // Gently restore normal velocities with more force
                    const currentVelX = bomb.body.velocity.x;
                    const currentVelY = bomb.body.velocity.y;
                    
                    // Apply stronger normal bomb speed if moving too slowly
                    if (Math.abs(currentVelX) < 100) {
                        bomb.setVelocityX(currentVelX > 0 ? 200 : -200);
                    }
                    if (Math.abs(currentVelY) < 100) {
                        bomb.setVelocityY(currentVelY > 0 ? 150 : -150);
                    }
                }
            });
        }
        
        if (stars && stars.children) {
            stars.children.entries.forEach(star => {
                if (star.active) {
                    star.body.setGravityY(0); // Reset to normal
                    star.setDrag(0); // Remove air resistance
                    star.setBounce(0.7); // Restore normal bounce
                }
            });
        }
        
        // Restore normal gravity for player
        this.body.setGravityY(this.originalPlayerGravity || 0);
        this.body.setDrag(0); // Remove air resistance
        
        // Remove visual effect - reset camera effects
        this.gameScene.cameras.main.resetPostPipeline();
        
        // Zero Gravity now recharges with star points instead of time
        this.zeroGravityAvailable = false;
        this.zeroGravityStarPointsCollected = 0; // Reset star point collection
        
        console.log(`Zero Gravity needs ${this.zeroGravityStarPointsNeeded} star points to recharge`);
    }
    
    // Enhanced star magnet during zero gravity
    applyStarMagnet(stars) {
        if (this.abilityRanks.starMagnet < 1 || !stars || !stars.children) {
            return;
        }
        
        // Base magnet properties
        const magnetRanges = [0, 80, 100, 130, 170, 220];
        const magnetForces = [0, 150, 180, 220, 280, 350];
        
        const baseMagnetRange = magnetRanges[this.abilityRanks.starMagnet] || 80;
        const baseMagnetForce = magnetForces[this.abilityRanks.starMagnet] || 150;
        
        // Enhanced effects during zero gravity - 2x stronger
        const magnetForce = this.zeroGravityStarMagnetBonus ? baseMagnetForce * 2 : baseMagnetForce;
        const magnetRange = this.zeroGravityStarMagnetBonus ? baseMagnetRange * 2 : baseMagnetRange;
        
        stars.children.entries.forEach(star => {
            if (star.active) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, star.x, star.y);
                
                if (distance < magnetRange && distance > 20) {
                    const force = Math.max(0.1, (magnetRange - distance) / magnetRange) * magnetForce;
                    const angle = Phaser.Math.Angle.Between(star.x, star.y, this.x, this.y);
                    
                    const forceX = Math.cos(angle) * force;
                    const forceY = Math.sin(angle) * force;
                    
                    star.setVelocity(
                        star.body.velocity.x + forceX,
                        star.body.velocity.y + forceY
                    );
                    
                    // Visual effect during zero gravity
                    if (this.zeroGravityStarMagnetBonus && !star.magnetTint) {
                        star.setTint(0x88aaff);
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