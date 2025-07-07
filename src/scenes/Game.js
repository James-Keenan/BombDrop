import { Player } from '../Games Objects/player.js';
import { MobileInputHandler } from '../mobileInputHandler.js';
import { GameWon } from './GameWon.js';

export class Game extends Phaser.Scene {
    // --- ACHIEVEMENT PROGRESS HELPERS ---
    incrementAchievement(key, amount = 1) {
        const prev = parseInt(localStorage.getItem(key) || '0', 10);
        localStorage.setItem(key, prev + amount);
    }

    setAchievementFlag(key) {
        localStorage.setItem(key, 'true');
    }
    constructor() {
        super('Game');

    }

    create() {
        // Get selected map from registry, fallback to default if not set
        const selectedMap = this.registry.get('selectedMap');
        console.log('Game scene create() called');
        // Get selected map key for per-map stats (handles random)
        const selectedMapKey = this.registry.get('selectedMapKey') || (selectedMap && selectedMap.key);
        // Use map background if available
        let bgKey = 'sky';
        if (selectedMap && selectedMap.backgroundKey) {
            bgKey = selectedMap.backgroundKey;
        }

        // --- ACHIEVEMENT: Played as character / on map ---
        this._selectedCharacter = this.registry.get('selectedCharacter') || 'dude';
        // Per-character play achievement
        if (this._selectedCharacter === 'dude') this.incrementAchievement('dudePlayed');
        if (this._selectedCharacter === 'cat') this.incrementAchievement('catPlayed');
        if (this._selectedCharacter === 'robot') this.incrementAchievement('robotPlayed');
        if (this._selectedCharacter === 'zarazombie') this.incrementAchievement('gabbiePlayed');
        if (this._selectedCharacter === 'pluto') this.incrementAchievement('plutoPlayed');
        if (this._selectedCharacter === 'pete') this.incrementAchievement('petePlayed');
        // Per-map play achievement
        if (selectedMapKey === 'mapOne') this.incrementAchievement('mapOnePlayed');
        if (selectedMapKey === 'catsbyCorner') this.incrementAchievement('catsbyCornerPlayed');
        if (selectedMapKey === 'robotMap') this.incrementAchievement('robotMapPlayed');
        if (selectedMapKey === 'gabbiesGrave') this.incrementAchievement('gabbiesGravePlayed');
        if (selectedMapKey === 'peteStreet') this.incrementAchievement('peteStreetPlayed');

        let bg = this.add.image(725, 475, bgKey);
        bg.setScale(1450 / bg.width, 950 / bg.height);

        // Pete's Street: add petefloor at the bottom if floorKey is present (after background, before platforms)
        if (selectedMap && selectedMap.key === 'peteStreet' && selectedMap.floorKey) {
            // Place floor at the very bottom, stretched to map width
            // Assuming game size is 1450x950, adjust as needed
            const floorY = 950 - 40/2; // 40 is the intended floor height
            const floor = this.add.image(725, floorY, selectedMap.floorKey);
            floor.setOrigin(0.5, 0.5);
            floor.displayWidth = 1450;
            floor.displayHeight = 40;
            floor.setDepth(0); // Behind all platforms
        }

        this.platforms = this.physics.add.staticGroup();
        // All platforms and moving platforms are now loaded from the selected map only.


        // Get selected character from registry, default to 'dude' if none selected
        const selectedCharacter = this.registry.get('selectedCharacter') || 'dude';

        // Get selected map from registry, fallback to default if not set
        // const selectedMap = this.registry.get('selectedMap');

        // If a map object is provided, use its platform data to build the level
        // Support both { platforms: [...] } and { data: { platforms: [...] } } map structures
        let platforms = null;
        if (selectedMap) {
            if (selectedMap.platforms) {
                platforms = selectedMap.platforms;
            } else if (selectedMap.data && selectedMap.data.platforms) {
                platforms = selectedMap.data.platforms;
            }
        }
        if (platforms) {
            // Remove default platforms
            this.platforms.clear(true, true);
            // Add platforms from selected map
            platforms.forEach((plat) => {
                // Use plat.imageKey if present (for Pete's Street), then plat.texture, plat.asset, plat.key, then 'ground'
                const textureKey = plat.imageKey || plat.texture || plat.asset || plat.key || 'ground';
                const platform = this.platforms.create(plat.x, plat.y, textureKey);
                // If width and height are specified, set display size
                if (plat.width && plat.height) {
                    platform.displayWidth = plat.width;
                    platform.displayHeight = plat.height;
                } else {
                    platform.setScale(plat.scaleX || 1, plat.scaleY || 1);
                }
                platform.refreshBody();
                // Always set body offset if bodyOffsetY is defined, even if bodyHeight is not
                if (plat.bodyOffsetY !== undefined) {
                    // If bodyHeight is defined, use it, otherwise use displayHeight
                    const bodyHeight = plat.bodyHeight !== undefined ? plat.bodyHeight : platform.displayHeight;
                    platform.body.setSize(platform.displayWidth, bodyHeight);
                    platform.body.setOffset(0, plat.bodyOffsetY);
                }
                // Ensure catfloor is always behind all other objects
                if (textureKey === 'catfloor') {
                    platform.setDepth(0);
                } else if (textureKey === 'zara ground' || textureKey === 'grass') {
                    platform.setDepth(1); // ground and grass below everything else
                } else {
                    platform.setDepth(2);
                }
            });
            // Add moving platforms if present
            if (selectedMap.movingPlatforms && selectedMap.movingPlatforms.length > 0) {
                const mp = selectedMap.movingPlatforms[0]; // Only one for now
                this.movingPlatform = this.physics.add.sprite(mp.x, mp.y, mp.key || 'ground').setScale(mp.scaleX || 1, mp.scaleY || 1);
                this.movingPlatform.body.setImmovable(true);
                this.movingPlatform.body.setGravityY(0);
                this.movingPlatform.setVelocityX(mp.velocityX || 0);
                this.movingPlatform.moveDirection = mp.moveDirection || 1;
                this.movingPlatform.minX = mp.minX || mp.x - 100;
                this.movingPlatform.maxX = mp.maxX || mp.x + 100;
                this.movingPlatform.originalX = mp.x;
            }
        }

        // Use player start from map if available
        let playerStart = { x: 100, y: 523 };
        if (selectedMap && selectedMap.playerStart) {
            playerStart = selectedMap.playerStart;
        }
        this.player = new Player(this, playerStart.x, playerStart.y, selectedCharacter);
        this.player.setDepth(10);

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

        // Add R key for Zero Gravity activation
        this.cursors.zeroGravity = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // Create stars with random positions and movement
        this.createMovingStars();

        // Ensure stars are above catfloor
        if (this.stars && this.stars.getChildren) {
            this.stars.getChildren().forEach(star => star.setDepth(20));
        }

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
        
        // Track zero gravity key state to prevent continuous activation
        this.zeroGravityKeyPressed = false;

        this.bombs = this.physics.add.group();

        // Ensure bombs are above catfloor
        if (this.bombs && this.bombs.getChildren) {
            this.bombs.getChildren().forEach(bomb => bomb.setDepth(20));
        }

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
        
        // Create Zero Gravity UI elements (initially hidden)
        this.createZeroGravityUI();

        // Release the first bomb immediately when the game starts
        this.releasedBomb();

        // Mobile detection and touch controls
        this.isMobile = this.detectMobile();
        
        // Virtual controls for mobile
        this.virtualControls = {
            left: false,
            right: false,
            jump: false,
            down: false,
            barrier: false,
            emp: false,
            sonicBoom: false
        };
        
        // Create mobile UI if on mobile device
        if (this.isMobile) {
            // this.createMobileControls(); // Removed old mobile controls creation
        }

        // Setup mobile input handler
        this.mobileInputHandler = new MobileInputHandler(this);
        
        // Show mobile controller when game starts (with delay to ensure game is loaded)
        setTimeout(() => {
            if (window.showMobileControllerForGame) {
                window.showMobileControllerForGame();
            }
        }, 200);
        
        // Check for unlocked upgrades
        this.checkAndUnlockMobileButtons();
    }

    update(time) {
        // Update player jump tracking
        this.player.update();

        // Update horizontally moving platform (only if it exists and is not destroyed)
        if (this.movingPlatform && this.movingPlatform.body) {
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
        
        if (this.cursors.left.isDown || this.virtualControls.left){
            this.player.moveLeft();
        }
        else if (this.cursors.right.isDown || this.virtualControls.right){
            this.player.moveRight();
        }
        else{
            this.player.idle();
        }

        // Handle jump input - keyboard or virtual controls (UP arrow, SPACE, or virtual jump button)
        const jumpPressed = this.cursors.up.isDown || this.cursors.space.isDown || this.virtualControls.jump;
        if (jumpPressed && !this.jumpKeyPressed) {
            this.player.jump();
            this.jumpKeyPressed = true;
        } else if (!jumpPressed) {
            this.jumpKeyPressed = false;
        }

        // Handle fast fall when down key is pressed or virtual down button
        if (this.cursors.down.isDown || this.virtualControls.down) {
            this.player.fastFall();
        }
        
        // Handle barrier activation with W key or virtual barrier button (only when unlocked)
        const barrierPressed = this.cursors.barrier.isDown || this.virtualControls.barrier;
        if (barrierPressed && !this.barrierKeyPressed) {
            if (this.player.activateBarrier()) {
                this.barrierKeyPressed = true;
            }
        } else if (!barrierPressed) {
            this.barrierKeyPressed = false;
        }
        
        // Handle EMP activation with E key or virtual EMP button (only when unlocked and available)
        const empPressed = this.cursors.emp.isDown || this.virtualControls.emp;
        if (empPressed && !this.empKeyPressed) {
            if (this.player.activateEMP(this.bombs)) {
                this.empKeyPressed = true;
            }
        } else if (!empPressed) {
            this.empKeyPressed = false;
        }
        
        // Handle Sonic Boom activation with Q key or virtual sonic boom button (only when unlocked and available)
        const sonicBoomPressed = this.cursors.sonicBoom.isDown || this.virtualControls.sonicBoom;
        if (sonicBoomPressed && !this.sonicBoomKeyPressed) {
            if (this.player.activateSonicBoom(this.bombs)) {
                this.sonicBoomKeyPressed = true;
            }
        } else if (!sonicBoomPressed) {
            this.sonicBoomKeyPressed = false;
        }
        
        // Handle Zero Gravity activation with R key or virtual zero gravity button (only when unlocked and available)
        const zeroGravityPressed = this.cursors.zeroGravity?.isDown || this.virtualControls.zeroGravity;
        if (zeroGravityPressed && !this.zeroGravityKeyPressed) {
            // Check if the method exists before calling it
            if (this.player.activateZeroGravity && typeof this.player.activateZeroGravity === 'function') {
                if (this.player.activateZeroGravity(this.bombs, this.stars)) {
                    this.zeroGravityKeyPressed = true;
                }
            } else {
                // Temporary fallback implementation until Player class is updated
                if (this.player.zeroGravityUnlocked && this.player.zeroGravityAvailable) {
                    console.log('Activating Zero Gravity (temporary implementation)');
                    this.activateZeroGravityTemporary();
                    this.zeroGravityKeyPressed = true;
                }
            }
        } else if (!zeroGravityPressed) {
            this.zeroGravityKeyPressed = false;
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
            
            // Update Zero Gravity UI
            this.updateZeroGravityUI();
            
            this.uiUpdateCounter = 0;
        }
        
        // Apply star magnet effect (this needs to be called every frame for smooth movement)
        this.player.applyStarMagnet(this.stars);

        // Update mobile input handler
        if (this.mobileInputHandler) {
            this.mobileInputHandler.update();
        }
    }

    collectStar (player, star){
        // Remove legacy star-based unlock tracking (now progress-based only)
        // Ensure selectedMapKey is always defined for this method
        const selectedMapKey = this.registry.get('selectedMapKey') || (this.registry.get('selectedMap') && this.registry.get('selectedMap').key);

        // --- Track all unlocks in this level-up ---
        let newlyUnlockedCharacters = [];
        let newlyUnlockedMaps = [];
        star.disableBody(true, true);

        // Apply star score value upgrade
        const scoreEarned = this.player.getStarScoreValue();
        this.score += scoreEarned;
        this.scoreText.setText('score: ' + this.score);

        // Track star collection for EMP charging (pass the actual points earned)
        this.player.collectStar(scoreEarned);

        // --- Ensure Zero Gravity charging works ---
        // If your Player.collectStar is correct, this is not needed.
        // But if you want to guarantee charging here, you can add:
        if (
            this.player.zeroGravityUnlocked &&
            !this.player.zeroGravityAvailable &&
            !this.player.zeroGravityActive
        ) {
            this.player.zeroGravityStarPointsCollected += scoreEarned;
            if (this.player.zeroGravityStarPointsCollected >= this.player.zeroGravityStarPointsNeeded) {
                this.player.zeroGravityAvailable = true;
                this.player.zeroGravityStarPointsCollected = 0;
                // Optional: show notification here if you want
            }
        }
        // --- End Zero Gravity charging block ---

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

            // --- Always update mapOne_highLevel on Turnup's Trail ---
            if (selectedMapKey === 'mapOne') {
                const prevHighLevel = parseInt(localStorage.getItem('mapOne_highLevel') || '0', 10);
                if (this.currentLevel > prevHighLevel) {
                    localStorage.setItem('mapOne_highLevel', this.currentLevel);
                    console.log('[DEBUG] Updated mapOne_highLevel to', this.currentLevel);
                }
                // --- UNLOCK Catsby's Corner if player has reached at least level 2 ---
                if (this.currentLevel >= 2 && localStorage.getItem('catsbyCornerUnlocked') !== 'true') {
                    localStorage.setItem('catsbyCornerUnlocked', 'true');
                    newlyUnlockedMaps.push({ key: 'catsbyCorner', label: "Catsby's Corner", previewKey: 'catBackground' });
                    console.log('[UNLOCK] Catsby\'s Corner unlocked!');
                }
            }

            // --- UNLOCK CHARACTERS AND MAPS BASED ON PROGRESS ---
            // Unlock Cat when any level of Catsby's Corner is completed
            if (selectedMapKey === 'catsbyCorner') {
                if (localStorage.getItem('catUnlocked') !== 'true' || localStorage.getItem('catsbyUnlocked') !== 'true') {
                    localStorage.setItem('catUnlocked', 'true');
                    localStorage.setItem('catsbyUnlocked', 'true'); // For playerSelect.js compatibility
                    newlyUnlockedCharacters.push({ key: 'cat', label: 'Cat' });
                }
                if (localStorage.getItem('robotMapUnlocked') !== 'true') {
                    localStorage.setItem('robotMapUnlocked', 'true');
                    newlyUnlockedMaps.push({ key: 'robotMap', label: "Tekno's Robot Map", previewKey: 'robotmap' });
                }
                if (newlyUnlockedCharacters.length > 0 || newlyUnlockedMaps.length > 0) {
                    console.log('[UNLOCK] Cat and/or Tekno\'s Robot Map unlocked!');
                }
            }
            // Unlock Tekno when any level of Robot Map is completed
            if (selectedMapKey === 'robotMap') {
                if (localStorage.getItem('robotUnlocked') !== 'true') {
                    localStorage.setItem('robotUnlocked', 'true');
                    newlyUnlockedCharacters.push({ key: 'robot', label: 'Tekno' });
                }
                if (localStorage.getItem('gabbiesGraveUnlocked') !== 'true') {
                    localStorage.setItem('gabbiesGraveUnlocked', 'true');
                    newlyUnlockedMaps.push({ key: 'gabbiesGrave', label: "Gabbie's Grave", previewKey: 'sky' });
                }
                if (newlyUnlockedCharacters.length > 0 || newlyUnlockedMaps.length > 0) {
                    console.log('[UNLOCK] Tekno and/or Gabbie\'s Grave unlocked!');
                }
            }
            // Unlock Gabbie when any level of Gabbie's Grave is completed
            if (selectedMapKey === 'gabbiesGrave') {
                if (localStorage.getItem('zarazombieUnlocked') !== 'true') {
                    localStorage.setItem('zarazombieUnlocked', 'true');
                    newlyUnlockedCharacters.push({ key: 'zarazombie', label: 'Gabbie' });
                }
                if (localStorage.getItem('peteStreetUnlocked') !== 'true') {
                    localStorage.setItem('peteStreetUnlocked', 'true');
                    newlyUnlockedMaps.push({ key: 'peteStreet', label: "Pete's Street", previewKey: 'sky' });
                }
                if (newlyUnlockedCharacters.length > 0 || newlyUnlockedMaps.length > 0) {
                    console.log('[UNLOCK] Gabbie and/or Pete\'s Street unlocked!');
                }
            }
            // Unlock Pluto when any level of Pete's Street is completed
            if (selectedMapKey === 'peteStreet') {
                if (localStorage.getItem('plutoUnlocked') !== 'true') {
                    localStorage.setItem('plutoUnlocked', 'true');
                    newlyUnlockedCharacters.push({ key: 'pluto', label: 'Pluto' });
                    console.log('[UNLOCK] Pluto unlocked!');
                }
            }
            // Unlock Pete when the player has won on every map (checked on win, but also here for safety)
            const allMaps = ['mapOneWin','catsbyCornerWin','robotMapWin','gabbiesGraveWin','peteStreetWin'];
            if (allMaps.every(k => parseInt(localStorage.getItem(k)||'0',10) > 0)) {
                if (localStorage.getItem('peteUnlocked') !== 'true') {
                    localStorage.setItem('peteUnlocked', 'true');
                    newlyUnlockedCharacters.push({ key: 'pete', label: 'Pete' });
                    console.log('[UNLOCK] Pete unlocked!');
                }
            }

            // Store all unlocks in registry arrays for GameOver/GameWon scenes
            if (newlyUnlockedCharacters.length > 0) {
                this.registry.set('unlockedCharacters', newlyUnlockedCharacters);
            } else {
                this.registry.remove('unlockedCharacters');
            }
            if (newlyUnlockedMaps.length > 0) {
                this.registry.set('unlockedMaps', newlyUnlockedMaps);
            } else {
                this.registry.remove('unlockedMaps');
            }

            // If max level (40) reached, trigger game won UI
            if (this.currentLevel > 40) {
                console.log('[WIN DEBUG] Triggering GameWon scene!');
                // --- ACHIEVEMENT: Win as character / on map ---
                if (this._selectedCharacter === 'dude') this.incrementAchievement('dudeWin');
                if (this._selectedCharacter === 'cat') this.incrementAchievement('catWin');
                if (this._selectedCharacter === 'robot') this.incrementAchievement('robotWin');
                if (this._selectedCharacter === 'zarazombie') this.incrementAchievement('gabbieWin');
                if (this._selectedCharacter === 'pluto') this.incrementAchievement('plutoWin');
                if (this._selectedCharacter === 'pete') this.incrementAchievement('peteWin');
                if (selectedMapKey === 'mapOne') this.incrementAchievement('mapOneWin');
                if (selectedMapKey === 'catsbyCorner') this.incrementAchievement('catsbyCornerWin');
                if (selectedMapKey === 'robotMap') this.incrementAchievement('robotMapWin');
                if (selectedMapKey === 'gabbiesGrave') this.incrementAchievement('gabbiesGraveWin');
                if (selectedMapKey === 'peteStreet') this.incrementAchievement('peteStreetWin');

                // --- ACHIEVEMENT: Master/expert checks (win with all, win on all) ---
                const allMaps = ['mapOneWin','catsbyCornerWin','robotMapWin','gabbiesGraveWin','peteStreetWin'];
                if (allMaps.every(k => parseInt(localStorage.getItem(k)||'0',10) > 0)) {
                    this.setAchievementFlag('allMapsWin');
                }
                const allChars = ['dudeWin','catWin','robotWin','gabbieWin','plutoWin','peteWin'];
                if (allChars.every(k => parseInt(localStorage.getItem(k)||'0',10) > 0)) {
                    this.setAchievementFlag('allCharactersWin');
                }
                if (this._selectedCharacter === 'dude') this.setAchievementFlag('turnupExpertWin');
                if (this._selectedCharacter === 'zarazombie') this.setAchievementFlag('gabbieExpertWin');
                if (this._selectedCharacter === 'cat') this.setAchievementFlag('catsbyExpertWin');
                if (this._selectedCharacter === 'robot') this.setAchievementFlag('teknoExpertWin');
                if (this._selectedCharacter === 'pluto') this.setAchievementFlag('plutoExpertWin');
                if (this._selectedCharacter === 'pete') this.setAchievementFlag('peteExpertWin');

                // Store the final score and level in the registry so GameWon scene can access it
                this.registry.set('finalScore', this.score);
                this.registry.set('finalLevel', 40);
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore);
                }
                if (selectedMapKey) {
                    const prevHighLevel = parseInt(localStorage.getItem(`${selectedMapKey}_highLevel`) || '0', 10);
                    if (40 > prevHighLevel) {
                        localStorage.setItem(`${selectedMapKey}_highLevel`, 40);
                    }
                    const prevHighScore = parseInt(localStorage.getItem(`${selectedMapKey}_highScore`) || '0', 10);
                    if (this.score > prevHighScore) {
                        localStorage.setItem(`${selectedMapKey}_highScore`, this.score);
                    }
                }
                this.time.delayedCall(1200, () => {
                    console.log('[WIN DEBUG] Calling this.scene.start("GameWon")');
                    this.scene.start('GameWon');
                });
                return;
            }

            // Update highest level if necessary
            if (this.currentLevel > this.highestLevel) {
                this.highestLevel = this.currentLevel;
                localStorage.setItem('highestLevel', this.highestLevel);
                // Save per-map highest level
                if (selectedMapKey) {
                    // Debug log for per-map highest level
                    console.log(`[SAVE] Setting ${selectedMapKey}_highLevel =`, this.highestLevel);
                    localStorage.setItem(`${selectedMapKey}_highLevel`, this.highestLevel);
                } else {
                    console.warn('[SAVE] No selectedMapKey when saving per-map highLevel!');
                }
            }
            // Update high score if necessary
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.highScore);
                this.highScoreText.setText('high score: ' + this.highScore);
                // Save per-map high score
                if (selectedMapKey) {
                    // Debug log for per-map high score
                    console.log(`[SAVE] Setting ${selectedMapKey}_highScore =`, this.highScore);
                    localStorage.setItem(`${selectedMapKey}_highScore`, this.highScore);
                } else {
                    console.warn('[SAVE] No selectedMapKey when saving per-map highScore!');
                }
            }
            
            // Award tokens for completing the level
            const baseTokens = this.currentLevel <= 2 ? 1 : 2; // 1 token for levels 1-2, then 2 tokens
            const bonusTokens = this.player.getBonusTokensPerLevel(); // Bonus tokens from upgrade
            const tokensEarned = baseTokens + bonusTokens;
            console.log('Tokens earned:', tokensEarned, '(base:', baseTokens, '+ bonus:', bonusTokens, ')');
            this.player.earnTokens(tokensEarned);
            this.updateTokenUI();

            // --- STAR AWARDING LOGIC ---
            // Each 7 levels = 1 star, up to 5 stars (35 levels)
            if (selectedMapKey && !this.selectedMapIsRandom) {
                const highLevel = parseInt(localStorage.getItem(`${selectedMapKey}_highLevel`) || '0', 10);
                let stars = Math.min(5, Math.floor(highLevel / 7));
                // Save to localStorage and update in real time
                localStorage.setItem(`${selectedMapKey}_stars`, stars);
                // Optionally, update a global variable for UI
                if (window.updateMapStars) window.updateMapStars(selectedMapKey, stars);
                console.log(`[STAR AWARD] Map ${selectedMapKey}: stars =`, stars);
            }
            
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

        // --- NEW: Save per-map stats on game over ---
        const selectedMapKey = this.registry.get('selectedMapKey');
        if (selectedMapKey) {
            // Save per-map highest level if current is higher
            const prevHighLevel = parseInt(localStorage.getItem(`${selectedMapKey}_highLevel`) || '0', 10);
            if (this.currentLevel > prevHighLevel) {
                console.log(`[SAVE] (GameOver) Setting ${selectedMapKey}_highLevel =`, this.currentLevel);
                localStorage.setItem(`${selectedMapKey}_highLevel`, this.currentLevel);
            }
            // Save per-map high score if current is higher
            const prevHighScore = parseInt(localStorage.getItem(`${selectedMapKey}_highScore`) || '0', 10);
            if (this.score > prevHighScore) {
                console.log(`[SAVE] (GameOver) Setting ${selectedMapKey}_highScore =`, this.score);
                localStorage.setItem(`${selectedMapKey}_highScore`, this.score);
            }
        } else {
            console.warn('[SAVE] (GameOver) No selectedMapKey when saving per-map stats!');
        }

        // --- UNLOCK CHECKS FOR GAME OVER (mirror collectStar logic) ---
        let newlyUnlockedCharacters = [];
        let newlyUnlockedMaps = [];
        // --- UNLOCK CHECKS FOR GAME OVER (always show if player qualifies, not just on first unlock) ---
        if (selectedMapKey === 'mapOne' && this.currentLevel >= 2) {
            if (localStorage.getItem('catsbyCornerUnlocked') !== 'true') {
                localStorage.setItem('catsbyCornerUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Catsby\'s Corner unlocked!');
            }
            newlyUnlockedMaps.push({ key: 'catsbyCorner', label: "Catsby's Corner", previewKey: 'catBackground' });
        }
        // Cat and Robot Map unlock
        if (selectedMapKey === 'catsbyCorner') {
            if (localStorage.getItem('catUnlocked') !== 'true' || localStorage.getItem('catsbyUnlocked') !== 'true') {
                localStorage.setItem('catUnlocked', 'true');
                localStorage.setItem('catsbyUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Cat unlocked!');
            }
            newlyUnlockedCharacters.push({ key: 'cat', label: 'Cat' });
            if (localStorage.getItem('robotMapUnlocked') !== 'true') {
                localStorage.setItem('robotMapUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Tekno\'s Robot Map unlocked!');
            }
            newlyUnlockedMaps.push({ key: 'robotMap', label: "Tekno's Robot Map", previewKey: 'robotmap' });
        }
        // Tekno and Gabbie's Grave unlock
        if (selectedMapKey === 'robotMap') {
            if (localStorage.getItem('robotUnlocked') !== 'true') {
                localStorage.setItem('robotUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Tekno unlocked!');
            }
            newlyUnlockedCharacters.push({ key: 'robot', label: 'Tekno' });
            if (localStorage.getItem('gabbiesGraveUnlocked') !== 'true') {
                localStorage.setItem('gabbiesGraveUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Gabbie\'s Grave unlocked!');
            }
            newlyUnlockedMaps.push({ key: 'gabbiesGrave', label: "Gabbie's Grave", previewKey: 'sky' });
        }
        // Gabbie and Pete's Street unlock
        if (selectedMapKey === 'gabbiesGrave') {
            if (localStorage.getItem('zarazombieUnlocked') !== 'true') {
                localStorage.setItem('zarazombieUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Gabbie unlocked!');
            }
            newlyUnlockedCharacters.push({ key: 'zarazombie', label: 'Gabbie' });
            if (localStorage.getItem('peteStreetUnlocked') !== 'true') {
                localStorage.setItem('peteStreetUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Pete\'s Street unlocked!');
            }
            newlyUnlockedMaps.push({ key: 'peteStreet', label: "Pete's Street", previewKey: 'sky' });
        }
        // Pluto unlock
        if (selectedMapKey === 'peteStreet') {
            if (localStorage.getItem('plutoUnlocked') !== 'true') {
                localStorage.setItem('plutoUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Pluto unlocked!');
            }
            newlyUnlockedCharacters.push({ key: 'pluto', label: 'Pluto' });
        }
        // Pete unlock
        const allMaps = ['mapOneWin','catsbyCornerWin','robotMapWin','gabbiesGraveWin','peteStreetWin'];
        if (allMaps.every(k => parseInt(localStorage.getItem(k)||'0',10) > 0)) {
            if (localStorage.getItem('peteUnlocked') !== 'true') {
                localStorage.setItem('peteUnlocked', 'true');
                console.log('[UNLOCK] (GameOver) Pete unlocked!');
            }
            newlyUnlockedCharacters.push({ key: 'pete', label: 'Pete' });
        }
        // Store all unlocks in registry arrays for GameOver/GameWon scenes (always show if player qualifies)
        if (newlyUnlockedCharacters.length > 0) {
            this.registry.set('unlockedCharacters', newlyUnlockedCharacters);
        } else {
            this.registry.remove('unlockedCharacters');
        }
        if (newlyUnlockedMaps.length > 0) {
            this.registry.set('unlockedMaps', newlyUnlockedMaps);
        } else {
            this.registry.remove('unlockedMaps');
        }

        // Transition to GameOver scene after a brief delay
        this.time.delayedCall(2000, () => {
            this.scene.start('GameOver');
        });
        return;
    }
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

    releasedBomb(){
        let x = (this.player.x < 725) ? Phaser.Math.Between(725, 1450) : Phaser.Math.Between(0, 725);

        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setDepth(20);
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        
        // Ensure bomb maintains consistent bounce and doesn't lose velocity
        bomb.body.bounce.setTo(1, 1);
        bomb.body.friction.setTo(0);
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
        star.setDepth(20);
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
        menuBackground.setDepth(100); // Ensure upgrade menu is above all platforms
        
        // Title with level info
        let title = this.add.text(725, 80, `LEVEL ${this.currentLevel} COMPLETE!`, {
            fontFamily: 'Arial Black',
            fontSize: 42,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        title.setDepth(101);
        
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
        tokensEarnedText.setDepth(101);
        
        // Current tokens display
        let currentTokensText = this.add.text(725, 180, `Tokens: ${this.player.tokens}  Special: ${this.player.specialTokens}`, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5);
        currentTokensText.setDepth(101);
        
        // Section headers
        let regularHeader = this.add.text(400, 210, 'REGULAR UPGRADES', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        regularHeader.setDepth(101);

        let premiumHeader = this.add.text(1000, 210, '★ PREMIUM UPGRADES ★', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        premiumHeader.setDepth(101);
        
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
        
        // Spread out upgrades more (wider grid)
        const regularUpgrades = [
            { name: 'jump', title: this.player.getJumpUpgradeName(), icon: '⬆', x: 180, y: 340 },
            { name: 'speed', title: this.player.getSpeedUpgradeName(), icon: '»', x: 390, y: 340 },
            { name: 'fastFall', title: 'Fast Fall', icon: '⬇', x: 600, y: 340 },
            { name: 'slowBombs', title: this.player.getSlowBombsUpgradeName(), icon: '🐌', x: 180, y: 540 },
            { name: 'starMultiplier', title: this.player.getStarMultiplierUpgradeName(), icon: '⭐', x: 180, y: 740 },
            { name: 'starMagnet', title: this.player.getStarMagnetUpgradeName(), icon: '🧲', x: 390, y: 540 },
            { name: 'lifeRegen', title: this.player.getLifeRegenUpgradeName(), icon: '♥', x: 600, y: 540 },
            { name: 'extraLife', title: this.player.getExtraLifeUpgradeName(), icon: '💖', x: 390, y: 740 }
        ];
        
        console.log('Regular upgrades defined:', regularUpgrades);
        
        // Premium upgrades: make boxes touch like regular upgrades (spacing 210px apart, same as regular)
        const premiumUpgrades = [
            { name: 'barrier', title: this.player.getBarrierUpgradeName(), icon: '⦿', x: 820, y: 340 },
            { name: 'emp', title: 'EMP', icon: '⚡', x: 1030, y: 340 },
            { name: 'sonicBoom', title: this.player.getSonicBoomUpgradeName(), icon: '💥', x: 1240, y: 340 },
            { name: 'platformDrop', title: this.player.getPlatformDropUpgradeName(), icon: '↕', x: 820, y: 540 },
            { name: 'tokenBonus', title: this.player.getTokenBonusUpgradeName(), icon: '💰', x: 1030, y: 540 },
            { name: 'zeroGravity', title: this.getZeroGravityUpgradeName(), icon: '🌌', x: 1240, y: 540 }
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
        const currentRank = this.player.abilityRanks[upgrade.name] || 0; // Add fallback for undefined ranks
        
        // Handle Zero Gravity upgrade with new cost logic
        let maxRank, canUpgrade, cost;
        
        if (upgrade.name === 'zeroGravity') {
            // Initialize zeroGravity rank if it doesn't exist
            if (!this.player.abilityRanks.zeroGravity) {
                this.player.abilityRanks.zeroGravity = 0;
            }
            
            maxRank = 3;
            // New cost logic for Zero Gravity
            if (currentRank === 0) {
                cost = { tokens: 0, specialTokens: 1 };
            } else if (currentRank === 1) {
                cost = { tokens: 6, specialTokens: 0 };
            } else if (currentRank === 2) {
                cost = { tokens: 12, specialTokens: 0 };
            } else {
                cost = { tokens: 0, specialTokens: 0 };
            }
            canUpgrade =
                currentRank < maxRank &&
                this.player.tokens >= cost.tokens &&
                this.player.specialTokens >= (cost.specialTokens || 0);
        } else {
            maxRank = this.player.getMaxRank(upgrade.name);
            canUpgrade = this.player.canUpgrade(upgrade.name);
            cost = this.player.getUpgradeCost(upgrade.name, currentRank);
        }
        

        // Card background (bigger to fit text)
        const cardWidth = 200;
        const cardHeight = 200;
        let card = this.add.rectangle(upgrade.x, upgrade.y, cardWidth, cardHeight, canUpgrade ? 0x004488 : 0x333333, 1);
        card.setStrokeStyle(4, isPremium ? 0xff00ff : 0x00ffff);
        card.setDepth(110); // Ensure upgrade cards are above menu background

        // Make card interactive for all cards (for tooltips)
        card.setInteractive();

        // Icon (smaller)
        let icon = this.add.text(upgrade.x, upgrade.y - 48, upgrade.icon, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff'
        }).setOrigin(0.5);
        icon.setDepth(111);

        // Title (smaller, but more space)
        let title = this.add.text(upgrade.x, upgrade.y + 5, upgrade.title, {
            fontFamily: 'Arial Black',
            fontSize: 22,
            color: '#ffffff',
            wordWrap: { width: cardWidth - 30 }
        }).setOrigin(0.5);
        title.setDepth(111);

        // Rank display (hide for extraLife)
        let rankText = '';
        let rank = null;

        if (upgrade.name !== 'extraLife') {
            rankText = `${currentRank}/${maxRank}`;
            if (currentRank >= maxRank) rankText = 'MAX';
            rank = this.add.text(upgrade.x, upgrade.y + 60, rankText, {
                fontFamily: 'Arial Black',
                fontSize: 16,
                color: currentRank >= maxRank ? '#00ff00' : '#ffffff'
            }).setOrigin(0.5);
            rank.setDepth(111);
        }
        // Cost display (smaller)
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

        let costDisplay = this.add.text(upgrade.x, upgrade.y + 85, costText, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: costColor
        }).setOrigin(0.5);
        costDisplay.setDepth(111);

        // Premium star indicator (smaller)
        if (isPremium) {
            let star = this.add.text(upgrade.x + 80, upgrade.y - 80, '★', {
                fontFamily: 'Arial Black',
                fontSize: 20,
                color: '#ff00ff'
            }).setOrigin(0.5);
            star.setDepth(111);
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
                // Handle Zero Gravity upgrade purchase with fallback
                if (upgrade.name === 'zeroGravity') {
                    this.purchaseZeroGravityUpgrade();
                } else {
                    this.purchaseUpgrade(upgrade.name);
                }
            });
        }
    }

    // Temporary Zero Gravity upgrade purchase handler
    purchaseZeroGravityUpgrade() {
        // Initialize zeroGravity rank if it doesn't exist
        if (!this.player.abilityRanks.zeroGravity) {
            this.player.abilityRanks.zeroGravity = 0;
        }
        
        const currentRank = this.player.abilityRanks.zeroGravity;
        // New cost logic for Zero Gravity
        let cost;
        if (currentRank === 0) {
            cost = { tokens: 0, specialTokens: 1 };
        } else if (currentRank === 1) {
            cost = { tokens: 6, specialTokens: 0 };
        } else if (currentRank === 2) {
            cost = { tokens: 12, specialTokens: 0 };
        } else {
            cost = { tokens: 0, specialTokens: 0 };
        }
        
        console.log('Attempting Zero Gravity purchase:', {
            currentRank,
            playerTokens: this.player.tokens,
            playerSpecialTokens: this.player.specialTokens,
            cost,
            canAfford: this.player.tokens >= cost.tokens && this.player.specialTokens >= (cost.specialTokens || 0)
        });
        
        // Check if player can afford it
        if (
            this.player.tokens >= cost.tokens &&
            this.player.specialTokens >= (cost.specialTokens || 0)
        ) {
            // Deduct cost
            this.player.tokens -= cost.tokens;
            if (cost.specialTokens) {
                this.player.specialTokens -= cost.specialTokens;
            }
            
            // Upgrade the rank
            this.player.abilityRanks.zeroGravity++;
            
            console.log('Zero Gravity upgrade successful! New rank:', this.player.abilityRanks.zeroGravity);
            
            // Unlock mobile button on first purchase
            if (this.player.abilityRanks.zeroGravity === 1) {
                console.log('Zero Gravity upgrade purchased, unlocking mobile button');
                this.unlockMobileAbility('zero gravity');
                
                // Set up basic Zero Gravity properties on player
                this.player.zeroGravityUnlocked = true;
                this.player.zeroGravityAvailable = true;
                this.player.zeroGravityActive = false;
                this.player.zeroGravityCooldown = 0;
            }
            
            // Refresh upgrade menu
            this.refreshUpgradeMenu();
            
            // Show upgrade effect
            this.showUpgradeEffect('zeroGravity');
        } else {
            console.log('Cannot afford Zero Gravity upgrade');
        }
    }

    // Add missing method for Zero Gravity upgrade name
    getZeroGravityUpgradeName() {
        if (!this.player || !this.player.abilityRanks) return 'Zero Gravity';
        
        const rank = this.player.abilityRanks.zeroGravity || 0;
        if (rank === 0) return 'Zero Gravity';
        if (rank === 1) return 'Zero Gravity I';
        if (rank === 2) return 'Zero Gravity II';
        if (rank === 3) return 'Zero Gravity III';
        return 'Zero Gravity MAX';
    }

    // Create Zero Gravity UI
    createZeroGravityUI() {
        // Zero Gravity UI - positioned next to barrier UI
        this.zeroGravityLabel = this.add.text(220, 870, 'Zero Gravity:', { fontSize: '20px', fill: '#8a2be2'});
        
        // Zero Gravity charge bar background
        this.zeroGravityBarBg = this.add.rectangle(220, 900, 200, 20, 0x333333);
        this.zeroGravityBarBg.setOrigin(0, 0.5);
        this.zeroGravityBarBg.setStrokeStyle(2, 0x8a2be2);
        
        // Zero Gravity charge bar fill
        this.zeroGravityBarFill = this.add.rectangle(222, 900, 196, 16, 0x8a2be2);
        this.zeroGravityBarFill.setOrigin(0, 0.5);
        
        // Zero Gravity instruction text
        this.zeroGravityInstruction = this.add.text(220, 920, 'Press R to activate', { fontSize: '14px', fill: '#ffffff'});
        
        // Initially hide zero gravity UI
        this.setZeroGravityUIVisible(false);
    }
    
    updateZeroGravityUI() {
        if (!this.player.zeroGravityUnlocked) {
            this.setZeroGravityUIVisible(false);
            return;
        }

        this.setZeroGravityUIVisible(true);

        // --- Use star-based recharge progress for UI ---
        let progress = this.player.getZeroGravityRechargeProgress
            ? this.player.getZeroGravityRechargeProgress()
            : { current: 0, needed: 1, percentage: 0 };

        this.zeroGravityBarFill.scaleX = Math.max(0.01, progress.percentage / 100);

        if (this.player.zeroGravityAvailable) {
            this.zeroGravityBarFill.setFillStyle(0x00ff00); // Green when ready
            this.zeroGravityLabel.setColor('#00ff00');
            this.zeroGravityInstruction.setText('Press R to activate');
        } else if (this.player.zeroGravityActive) {
            this.zeroGravityBarFill.setFillStyle(0xffff00); // Yellow when active
            this.zeroGravityLabel.setColor('#ffff00');
            this.zeroGravityInstruction.setText('ZERO GRAVITY ACTIVE!');
        } else {
            this.zeroGravityBarFill.setFillStyle(0xff4444); // Red when charging
            this.zeroGravityLabel.setColor('#ff4444');
            this.zeroGravityInstruction.setText(
                `Collect ${progress.needed - progress.current} more star points`
            );
        }
    }
    
    setZeroGravityUIVisible(visible) {
        this.zeroGravityLabel.setVisible(visible);
        this.zeroGravityBarBg.setVisible(visible);
        this.zeroGravityBarFill.setVisible(visible);
        this.zeroGravityInstruction.setVisible(visible);
    }

    // Life Regen UI functions
    createLifeRegenUI() {
        // Only create if Life Regen is unlocked
        if (this.player.abilityRanks.lifeRegen === 0) {
            return;
        }

        // Create Life Regen meter next to lives counter
        const lifeRegenX = 480;
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
        
        // Label for the meter
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
            this.createLifeRegenUI();
        }

        // Update progress bar
        if (this.lifeRegenBar) {
            const progress = this.player.getLifeRegenProgress();
            
            if (!this.lastLifeRegenProgress || 
                this.lastLifeRegenProgress.current !== progress.current || 
                this.lastLifeRegenProgress.needed !== progress.needed) {
                
                const maxWidth = 156;
                const currentWidth = Math.max(1, Math.min(maxWidth, maxWidth * (progress.current / progress.needed)));
                
                this.lifeRegenBar.setSize(currentWidth, 12);
                
                if (progress.current >= progress.needed) {
                    this.lifeRegenBar.setFillStyle(0xffff00);
                    this.lifeRegenLabel.setText('READY!');
                    this.lifeRegenLabel.setColor('#ffff00');
                } else {
                    this.lifeRegenBar.setFillStyle(0x00ff88);
                    this.lifeRegenLabel.setText(`LIFE REGEN (${progress.current}/${progress.needed})`);
                    this.lifeRegenLabel.setColor('#ffffff');
                }
                
                this.lastLifeRegenProgress = {
                    current: progress.current,
                    needed: progress.needed
                };
            }
        }
    }

    // Clear old version data
    clearOldVersionData() {
        const CURRENT_VERSION = '3.0';
        const storedVersion = localStorage.getItem('gameVersion');
        
        if (!storedVersion || storedVersion !== CURRENT_VERSION) {
            console.log('New version detected! Clearing old data for fresh start...');
            
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
            
            localStorage.setItem('gameVersion', CURRENT_VERSION);
            
            console.log('Old data cleared! Starting fresh with version', CURRENT_VERSION);
            
            this.showVersionUpdateNotification();
        }
    }
    
    showVersionUpdateNotification() {
        let notificationBg = this.add.rectangle(725, 200, 600, 120, 0x000000, 0.95);
        notificationBg.setStrokeStyle(3, 0x00ff00);
        notificationBg.setDepth(2000);
        
        let title = this.add.text(725, 170, 'GAME UPDATED!', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        title.setDepth(2001);
        
        let message = this.add.text(725, 200, 'Welcome to BombDrop v3.0!\nYour progress has been reset for the new version.', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        message.setDepth(2001);
        
        let subtext = this.add.text(725, 235, 'New features: Life Regen, balanced abilities, improved gameplay!', {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#ffff00'
        }).setOrigin(0.5);
        subtext.setDepth(2001);
        
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

    // Add missing methods that are referenced but not defined
    purchaseUpgrade(abilityName) {
        const wasLifeRegenLocked = (abilityName === 'lifeRegen' && this.player.abilityRanks.lifeRegen === 0);
        
        if (this.player.upgradeAbility(abilityName)) {
            if (wasLifeRegenLocked) {
                this.lives++;
                this.livesText.setText('Lives: ' + this.lives);
                
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
            
            // Unlock mobile buttons when abilities are first purchased
            if (abilityName === 'fastFall' && this.player.abilityRanks.fastFall === 1) {
                this.unlockMobileAbility('fast fall');
            }
            if (abilityName === 'barrier' && this.player.abilityRanks.barrier === 1) {
                this.unlockMobileAbility('barrier');
            }
            if (abilityName === 'emp' && this.player.abilityRanks.emp === 1) {
                this.unlockMobileAbility('emp');
            }
            if (abilityName === 'sonicBoom' && this.player.abilityRanks.sonicBoom === 1) {
                this.unlockMobileAbility('sonic');
            }
            
            this.updateTokenUI();
            this.refreshUpgradeMenu();
            this.showUpgradeEffect(abilityName);
        }
    }

    refreshUpgradeMenu() {
        const elementsToKeep = 6;
        while (this.upgradeMenuElements.length > elementsToKeep) {
            const element = this.upgradeMenuElements.pop();
            if (element && element.destroy) {
                element.destroy();
            }
        }
        
        this.createUpgradeCards();
        this.createContinueButton();
        
        if (this.upgradeMenuElements[3]) {
            this.upgradeMenuElements[3].setText(`Tokens: ${this.player.tokens}  Special: ${this.player.specialTokens}`);
        }
    }

    createContinueButton() {
        let continueButton = this.add.rectangle(725, 780, 250, 60, 0x00aa00, 1);
        continueButton.setStrokeStyle(3, 0x00ff00);
        continueButton.setInteractive();
        continueButton.setDepth(120);

        let continueButtonText = this.add.text(725, 780, 'CONTINUE', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5);
        continueButtonText.setDepth(121);

        this.upgradeMenuElements.push(continueButton, continueButtonText);
        
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
        let upgradeDisplayName = abilityName;
        
        let effectText = this.add.text(600, 600, `${upgradeDisplayName} UPGRADED!`, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.upgradeMenuElements.push(effectText);
        
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
        this.hideTooltip();
        
        if (this.upgradeMenuElements) {
            this.upgradeMenuElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.upgradeMenuElements = [];
        }
        
        if (this.escKey) {
            this.escKey.removeAllListeners();
            this.input.keyboard.removeKey(this.escKey);
            this.escKey = null;
        }
        
        this.continueLevelAfterUpgrade();
    }

    continueLevelAfterUpgrade() {
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
                
                this.physics.resume();
                this.input.keyboard.enabled = true;
                
                this.cursors.left.isDown = false;
                this.cursors.right.isDown = false;
                this.cursors.up.isDown = false;
                this.cursors.down.isDown = false;
                this.cursors.space.isDown = false;
                this.cursors.barrier.isDown = false;
                
                this.barrierKeyPressed = false;
                this.jumpKeyPressed = false;
                this.sonicBoomKeyPressed = false;
                
                const numStars = 12;
                for (let i = 0; i < numStars; i++) {
                    this.createFlyingStar();
                }

                this.releasedBomb();
            }
        });
    }

    createTooltip(x, y, title, description) {
        this.hideTooltip();
        
        const tooltipWidth = 600;
        const tooltipHeight = 220;

        let adjustedX = x;
        let adjustedY = y - tooltipHeight - 10;

        if (adjustedX + tooltipWidth > 1450) {
            adjustedX = 1450 - tooltipWidth - 10;
        }
        if (adjustedX < 10) {
            adjustedX = 10;
        }
        if (adjustedY < 10) {
            adjustedY = y + 120;
        }

        this.tooltip = this.add.rectangle(adjustedX + tooltipWidth/2, adjustedY + tooltipHeight/2, tooltipWidth, tooltipHeight, 0x000000, 0.97);
        this.tooltip.setStrokeStyle(5, 0xffffff);
        this.tooltip.setDepth(1000);

        this.tooltipTitle = this.add.text(adjustedX + 30, adjustedY + 30, title, {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffff00',
            wordWrap: { width: tooltipWidth - 60 }
        });
        this.tooltipTitle.setDepth(1001);

        this.tooltipDescription = this.add.text(adjustedX + 30, adjustedY + 90, description, {
            fontFamily: 'Arial',
            fontSize: 28,
            color: '#ffffff',
            wordWrap: { width: tooltipWidth - 60 }
        });
        this.tooltipDescription.setDepth(1001);

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
                desc: `Allows additional air jumps. Current: ${currentRank === 0 ? 'Ground only' : `${currentRank + 1} total jumps`}`
            },
            speed: {
                title: 'Super Speed',
                desc: `Increases movement speed. Current: ${currentRank === 0 ? 'Normal' : `Tier ${currentRank}`}`
            },
            fastFall: {
                title: 'Fast Fall',
                desc: `Fall faster when holding DOWN. Current: ${currentRank === 0 ? 'Normal fall' : `Enhanced fall speed`}`
            },
            slowBombs: {
                title: 'Slow Bombs',
                desc: `Permanently slows bomb movement. Current: ${currentRank === 0 ? 'Normal bombs' : `Bombs are slower`}`
            },
            starMagnet: {
                title: 'Star Magnet',
                desc: `Attracts nearby stars automatically. Current: ${currentRank === 0 ? 'No attraction' : `Active attraction`}`
            },
            starMultiplier: {
                title: 'Star Multiplier',
                desc: `Increases points per star collected. Current: Enhanced star value`
            },
            extraLife: {
                title: 'Extra Life',
                desc: 'Immediately grants +1 life. Can be purchased multiple times.'
            },
            barrier: {
                title: 'Energy Barrier',
                desc: `Blocks bombs temporarily (W key). Charges with star points.`
            },
            emp: {
                title: 'EMP Blast',
                desc: `Destroys all bombs (E key). Requires star points to charge.`
            },
            platformDrop: {
                title: 'Platform Phasing',
                desc: `Pass through platforms with special controls.`
            },
            tokenBonus: {
                title: 'Token Bonus',
                desc: `Extra tokens per level completed.`
            },
            sonicBoom: {
                title: 'Sonic Boom',
                desc: `Throw pulse grenade to destroy bombs (Q key).`
            },
            lifeRegen: {
                title: 'Life Regen',
                desc: `Regenerate lives by collecting star points.`
            },
            zeroGravity: {
                title: 'Zero Gravity',
                desc: `Activates anti-gravity field (R key). Reduces bomb gravity and enhances star magnet.`
            }
        };
        
        return descriptions[abilityName] || { title: 'Unknown', desc: 'No description available.' };
    }

    // Custom collision process for platform drop ability
    platformCollisionProcess(player, platform) {
        if (this.player.platformJumpUnlocked && 
            player.body.velocity.y < 0 && 
            player.body.bottom > platform.body.top) {
            return false;
        }
        
        if (this.player.platformDropUnlocked && 
            this.cursors.down.isDown && 
            player.body.velocity.y > 0 && 
            player.y < platform.y) {
            
            const isGroundPlatform = Math.abs(platform.y - 950) < 5;
            const isTallWallPlatform = Math.abs(platform.y - 825) < 5;
            
            if ((isGroundPlatform || isTallWallPlatform) && !this.player.platformDropAllUnlocked) {
                return true;
            }
            
            return false;
        }
        
        return true;
    }

    // Mobile detection function
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
        
        return isMobileDevice || (isTouchDevice && isSmallScreen);
    }

    checkAndUnlockMobileButtons() {
        // Placeholder for mobile button unlocking logic
    }

    unlockMobileAbility(abilityName) {
        console.log('Game unlocking mobile ability:', abilityName);
        
        if (window.unlockMobilePowerUp) {
            window.unlockMobilePowerUp(abilityName);
        }
        
        try {
            let unlockedAbilities = JSON.parse(localStorage.getItem('mobile-unlocked') || '[]');
            if (!unlockedAbilities.includes(abilityName)) {
                unlockedAbilities.push(abilityName);
                localStorage.setItem('mobile-unlocked', JSON.stringify(unlockedAbilities));
            }
        } catch (error) {
            console.log('Failed to save mobile unlock:', error);
        }
    }
    
    // Temporary Zero Gravity activation implementation
    activateZeroGravityTemporary() {
        if (!this.player.zeroGravityUnlocked || !this.player.zeroGravityAvailable) {
            return false;
        }
        
        console.log('Zero Gravity activated temporarily - MAXIMUM POWER!');
        
        // Set zero gravity state
        this.player.zeroGravityActive = true;
        this.player.zeroGravityAvailable = false;
        
        // Store original gravity values for restoration
        this.originalPlayerGravity = this.player.body.gravity.y;
        this.originalWorldGravity = this.physics.world.gravity.y;
        
        // MAXIMUM anti-gravity effect - complete weightlessness
        this.bombs.children.entries.forEach(bomb => {
            if (bomb.active) {
                bomb.body.setGravityY(-3000); // Massive anti-gravity - bombs float up rapidly
                // Make bombs almost stop moving
                bomb.setVelocity(bomb.body.velocity.x * 0.05, bomb.body.velocity.y * 0.05);
                bomb.setDrag(100); // Heavy air resistance
                bomb.setBounce(0.1); // Almost no bounce
            }
        });
        
        this.stars.children.entries.forEach(star => {
            if (star.active) {
                star.body.setGravityY(-2500); // Massive anti-gravity for stars
                // Make stars almost weightless
                star.setVelocity(star.body.velocity.x * 0.02, star.body.velocity.y * 0.02);
                star.setDrag(80); // Heavy air resistance
                star.setBounce(0.05); // Minimal bouncing
                
                // Strong upward drift
                const upwardForce = Phaser.Math.Between(-40, -20);
                star.setVelocityY(star.body.velocity.y + upwardForce);
            }
        });
        
        // Apply extreme moon gravity to player
        this.player.body.setGravityY(-1200); // Player floats upward strongly
        this.player.body.setDrag(40); // Air resistance for player
        
        // Give player strong initial upward momentum
        if (this.player.body.velocity.y > 0) {
            this.player.setVelocityY(this.player.body.velocity.y * 0.1);
        }
        // Add upward boost to player
        this.player.setVelocityY(this.player.body.velocity.y - 50);
        
        // Continuous extreme zero gravity effects
       
        this.zeroGravityEffectTimer = this.time.addEvent({
            delay: 50, // Every 50ms for stronger effect
            callback: () => {
                // Apply continuous strong anti-gravity to all objects
                this.bombs.children.entries.forEach(bomb => {
                    if (bomb.active) {
                        // Strong upward drift with random movement
                        const driftX = Phaser.Math.Between(-8, 8);
                        const driftY = Phaser.Math.Between(-25, -10); // Strong upward drift
                        bomb.setVelocity(
                            bomb.body.velocity.x + driftX,
                            bomb.body.velocity.y + driftY
                        );
                        
                        // Very strict velocity limits for extreme floating
                        const maxVel = 30;
                        if (Math.abs(bomb.body.velocity.x) > maxVel) {
                            bomb.setVelocityX(bomb.body.velocity.x > 0 ? maxVel : -maxVel);
                        }
                        if (bomb.body.velocity.y > maxVel) {
                            bomb.setVelocityY(maxVel);
                        }
                        
                        // Add constant upward force
                        bomb.setVelocityY(bomb.body.velocity.y - 5);
                    }
                });
                
                this.stars.children.entries.forEach(star => {
                    if (star.active) {
                        // Strong upward drift
                        const driftY = Phaser.Math.Between(-20, -8);
                        star.setVelocityY(star.body.velocity.y + driftY);
                        
                        // Very gentle movement limits
                        const maxVel = 20;
                        if (Math.abs(star.body.velocity.x) > maxVel) {
                            star.setVelocityX(star.body.velocity.x > 0 ? maxVel : -maxVel);
                        }
                        if (star.body.velocity.y > maxVel) {
                            star.setVelocityY(maxVel);
                        }
                        
                        // Add constant gentle upward force
                        star.setVelocityY(star.body.velocity.y - 3);
                    }
                });
                
                // Keep player floating strongly
                if (this.player.body.velocity.y > 50) {
                    this.player.setVelocityY(50); // Cap downward velocity very low
                }
                
                // Add gentle upward force to player
                this.player.setVelocityY(this.player.body.velocity.y - 2);
            },
            loop: true
        });
        
        // ULTRA MASSIVE star magnet effect - attract from anywhere on screen
        this.stars.children.entries.forEach(star => {
            if (star.active) {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, star.x, star.y);
                const maxDistance = 1200; // Beyond screen size - attracts everything
                
                if (distance < maxDistance) {
                    const force = Math.max(2.0, (maxDistance - distance) / maxDistance) * 40; // Ultra massive force
                    const angle = Phaser.Math.Angle.Between(star.x, star.y, this.player.x, this.player.y);
                    
                    const forceX = Math.cos(angle) * force;
                    const forceY = Math.sin(angle) * force;
                    
                    star.setVelocity(star.body.velocity.x + forceX, star.body.velocity.y + forceY);
                }
            }
        });
        
        // Strong visual effect - more pronounced screen tint
        this.cameras.main.setTint(0xccccff); // Stronger blue tint
        
        // Create floating particle effect
        this.createZeroGravityParticles();
        
               
        // Even longer duration - truly extended weightlessness
        const rank = this.player.abilityRanks.zeroGravity || 1;
        const duration = 18000 + (rank - 1) * 6000; // 18s base + 6s per rank (up to 30s at max rank)
        
        // Deactivate after duration
        this.time.delayedCall(duration, () => {
            this.deactivateZeroGravityTemporary();
        });
        
        return true;
    }
    
    createZeroGravityParticles() {
        // Create floating particle effect to show zero gravity is active
        if (!this.zeroGravityParticles) {
            this.zeroGravityParticles = [];
        }
        
        // Create 20 floating particles
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, 1450),
                Phaser.Math.Between(200, 950),
                Phaser.Math.Between(2, 6),
                0x88aaff,
                0.6
            );
            
            this.physics.add.existing(particle);
            particle.body.setGravityY(-500);
            particle.body.setVelocity(
                Phaser.Math.Between(-20, 20),
                Phaser.Math.Between(-30, -10)
            );
            
            this.zeroGravityParticles.push(particle);
        }
    }
    
    deactivateZeroGravityTemporary() {
        console.log('Zero Gravity deactivated - returning to normal gravity');
        
        this.player.zeroGravityActive = false;
        
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
        
        // Restore normal gravity and physics for all objects
        this.bombs.children.entries.forEach(bomb => {
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
        
        this.stars.children.entries.forEach(star => {
            if (star.active) {
                star.body.setGravityY(0); // Reset to normal
                star.setDrag(0); // Remove air resistance
                star.setBounce(0.7); // Restore normal bounce
            }
        });
        
        // Restore normal gravity for player
        this.player.body.setGravityY(this.originalPlayerGravity || 0);
        this.player.body.setDrag(0); // Remove air resistance
        
        // Remove visual effect
        this.cameras.main.clearTint();
        
        // Longer cooldown for such an extremely powerful effect
        const rank = this.player.abilityRanks.zeroGravity || 1;
        const cooldown = 30000 - (rank - 1) * 4000; // 30s base - 4s per rank (minimum 18s at max rank)
        
        this.time.delayedCall(cooldown, () => {
            this.player.zeroGravityAvailable = true;
            console.log('Zero Gravity ready again');
        });
    }
}