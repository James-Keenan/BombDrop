export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
        this.characters = [
            { key: 'dude', label: 'Turnup for what', previewKey: 'dude', previewFrame: 4, scale: 2.5 },
            { key: 'cat', label: 'the great CATsby', previewKey: 'cat', previewFrame: 4, scale: 0.25 },
            { key: 'Tekno', label: 'Tekno', previewKey: 'robot', previewFrame: 4, scale: 0.25 }
        ];
        this.selectedCharacterIndex = 0;
        this.dynamicElements = [];
        this.particles = [];
    }

    create() {
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        this.showingRules = false;
        this.createDynamicMenu();
        
        // Hide mobile controller in menu
        if (window.hideMobileController) {
            window.hideMobileController();
        }
        
        // Ensure start button works properly
        // Find your start/play button and make sure it transitions correctly
        if (this.startButton || this.playButton) {
            const button = this.startButton || this.playButton;
            
            button.on('pointerdown', () => {
                console.log('Start game button pressed - transitioning to Game scene');
                
                // Clear any mobile controller modes that might interfere
                if (window.hideMobileController) {
                    window.hideMobileController();
                }
                
                // Start the game scene
                this.scene.start('Game');
            });
        }
    }
    
    // Mobile detection function (same as in Game.js)
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
        
        return isMobileDevice || (isTouchDevice && isSmallScreen);
    }

    createDynamicMenu() {
        // Clear any existing content
        this.children.removeAll();
        this.dynamicElements = [];
        this.particles = [];

        // Create awesome layered background with dynamic elements
        this.createDynamicBackground();

        // Create full-screen vertical layout with dynamic spacing
        this.createVerticalLayout();

        // Add dynamic particles and atmospheric effects
        this.createDynamicAtmosphere();

        // Setup all interactions
        this.setupMenuInteractions();

        this.showingRules = false;
    }

    createDynamicBackground() {
        // Main background with gradient effect
        let bg = this.add.image(725, 475, 'sky');
        bg.setScale(1450 / bg.width, 950 / bg.height);
        bg.setTint(0x88aaff);

        // Add dynamic floating platforms across the entire height
        const platforms = [
            {x: 200, y: 100, scale: 0.4, alpha: 0.3},
            {x: 1250, y: 180, scale: 0.5, alpha: 0.4},
            {x: 150, y: 300, scale: 0.3, alpha: 0.3},
            {x: 1300, y: 400, scale: 0.4, alpha: 0.3},
            {x: 100, y: 550, scale: 0.5, alpha: 0.4},
            {x: 1350, y: 650, scale: 0.3, alpha: 0.3},
            {x: 200, y: 800, scale: 0.4, alpha: 0.4},
            {x: 1200, y: 870, scale: 0.3, alpha: 0.3}
        ];

        platforms.forEach((platform, index) => {
            const platformSprite = this.add.image(platform.x, platform.y, 'platform')
                .setScale(platform.scale)
                .setAlpha(platform.alpha)
                .setTint(0x6699cc);

            // Dynamic floating animation with different phases
            this.tweens.add({
                targets: platformSprite,
                y: platform.y - 15,
                duration: 2500 + (index * 400),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Subtle horizontal drift
            this.tweens.add({
                targets: platformSprite,
                x: platform.x + (index % 2 === 0 ? 20 : -20),
                duration: 4000 + (index * 500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.dynamicElements.push(platformSprite);
        });
    }

    createVerticalLayout() {
        const centerX = 725;

        // TOP SECTION (Y: 50-150) - Game Title
        this.createTopSection(centerX);

        // UPPER SECTION (Y: 200-300) - Subtitle and Stats
        this.createUpperSection(centerX);

        // MIDDLE SECTION (Y: 350-500) - Action Buttons
        this.createMiddleSection(centerX);

        // LOWER SECTION (Y: 550-750) - Character Selection
        this.createLowerSection(centerX);

        // BOTTOM SECTION (Y: 800-900) - Credits/Instructions
        this.createBottomSection(centerX);
    }

    createTopSection(centerX) {
        // Massive dynamic title at the very top
        const gameTitle = this.add.text(centerX, 100, 'BombDrop', {
            fontFamily: 'Arial Black',
            fontSize: 96,
            color: '#ffffff',
            stroke: '#ff4466',
            strokeThickness: 10,
            align: 'center',
            shadow: {
                offsetX: 6,
                offsetY: 6,
                color: '#000000',
                blur: 15,
                fill: true
            }
        }).setOrigin(0.5);

        // Epic title animations
        this.tweens.add({
            targets: gameTitle,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Color shift animation
        this.tweens.add({
            targets: gameTitle,
            tint: 0xffaacc,
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.dynamicElements.push(gameTitle);
    }

    createUpperSection(centerX) {
        // Dynamic subtitle with bounce
        const subtitle = this.add.text(centerX, 200, 'Avoid the Bombs, Collect the Stars!', {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffff66',
            stroke: '#333333',
            strokeThickness: 4,
            align: 'center',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: subtitle,
            y: 190,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Stats section with dynamic containers
        this.createStatsSection(centerX);

        this.dynamicElements.push(subtitle);
    }

    createStatsSection(centerX) {
        const statsY = 270;
        
        // Get saved data
        const highScore = localStorage.getItem('highScore') || 0;
        const highestLevel = localStorage.getItem('highestLevel') || 1;

        // Personal Best container
        const scoreContainer = this.add.container(centerX - 150, statsY);
        const scoreBg = this.add.rectangle(0, 0, 280, 60, 0x003366, 0.8);
        scoreBg.setStrokeStyle(3, 0x66aaff);
        
        const scoreIcon = this.add.image(-80, 0, 'star').setScale(0.7).setTint(0xffff66);
        const scoreText = this.add.text(20, 0, `Personal Best: ${highScore}`, {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#ffffff',
            stroke: '#000033',
            strokeThickness: 2
        }).setOrigin(0.5);

        scoreContainer.add([scoreBg, scoreIcon, scoreText]);

        // Highest Level container
        const levelContainer = this.add.container(centerX + 150, statsY);
        const levelBg = this.add.rectangle(0, 0, 280, 60, 0x663300, 0.8);
        levelBg.setStrokeStyle(3, 0xff9933);
        
        const levelIcon = this.add.image(-80, 0, 'bomb').setScale(0.4).setTint(0xff9933);
        const levelText = this.add.text(20, 0, `Highest Level: ${highestLevel}`, {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#ffffff',
            stroke: '#330000',
            strokeThickness: 2
        }).setOrigin(0.5);

        levelContainer.add([levelBg, levelIcon, levelText]);

        // Floating animations for stats
        this.tweens.add({
            targets: scoreContainer,
            y: statsY - 10,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: levelContainer,
            y: statsY - 10,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1000
        });

        // Icon animations
        this.tweens.add({
            targets: scoreIcon,
            rotation: Math.PI * 2,
            duration: 4000,
            repeat: -1,
            ease: 'Linear'
        });

        this.tweens.add({
            targets: levelIcon,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.dynamicElements.push(scoreContainer, levelContainer);
    }

    createMiddleSection(centerX) {
        // Dynamic action buttons with enhanced effects
        const startButton = this.createDynamicButton(centerX, 400, 'START GAME', '#ff4466', '#ff6688', () => {
            console.log('Start button clicked!');
            this.registry.set('selectedCharacter', this.characters[this.selectedCharacterIndex].key);
            console.log('Selected character:', this.characters[this.selectedCharacterIndex].key);
            this.startGameTransition();
        });

        const rulesButton = this.createDynamicButton(centerX, 480, 'HOW TO PLAY', '#44ff66', '#66ff88', () => {
            this.showRules();
        });

        // Add connecting energy between buttons
        const energyLine = this.add.rectangle(centerX, 440, 350, 4, 0x66aaff, 0.6);
        this.tweens.add({
            targets: energyLine,
            alpha: 0.2,
            scaleX: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.dynamicElements.push(startButton, rulesButton, energyLine);
    }

    createDynamicButton(x, y, text, primaryColor, hoverColor, callback) {
        const container = this.add.container(x, y);

        // Enhanced button with multiple layers
        const outerGlow = this.add.rectangle(0, 0, 370, 70, parseInt(primaryColor.replace('#', '0x')), 0.2);
        const buttonBg = this.add.rectangle(0, 0, 350, 60, 0x001133, 0.9);
        buttonBg.setStrokeStyle(4, primaryColor);
        const innerHighlight = this.add.rectangle(0, -2, 340, 3, parseInt(primaryColor.replace('#', '0x')), 0.8);

        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: primaryColor,
            stroke: '#000033',
            strokeThickness: 5,
            align: 'center',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        container.add([outerGlow, buttonBg, innerHighlight, buttonText]);
        container.setSize(350, 60);
        container.setInteractive();

        // Dynamic hover effects
        const hoverIn = () => {
            buttonBg.setFillStyle(0x002244, 0.9);
            buttonBg.setStrokeStyle(4, hoverColor);
            buttonText.setTint(parseInt(hoverColor.replace('#', '0x')));
            outerGlow.setFillStyle(parseInt(hoverColor.replace('#', '0x')), 0.4);
            
            this.tweens.add({
                targets: container,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });

            this.createButtonParticles(x, y, hoverColor);
        };

        const hoverOut = () => {
            buttonBg.setFillStyle(0x001133, 0.9);
            buttonBg.setStrokeStyle(4, primaryColor);
            buttonText.clearTint();
            outerGlow.setFillStyle(parseInt(primaryColor.replace('#', '0x')), 0.2);
            
            this.tweens.add({
                targets: container,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 200,
                ease: 'Back.easeOut'
            });
        };

        container.on('pointerover', hoverIn);
        container.on('pointerout', hoverOut);
        container.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: callback
            });
        });

        // Idle pulse animation
        this.tweens.add({
            targets: outerGlow,
            alpha: 0.4,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return container;
    }

    showRules() {
        // Clear existing content
        this.children.removeAll();
        this.particles = [];

        // Create dynamic background for rules
        let bg = this.add.image(725, 475, 'sky').setAlpha(0.9);
        bg.setScale(1450 / bg.width, 950 / bg.height);
        bg.setTint(0x88aaff);

        // Add subtle particle effects
        for (let i = 0; i < 15; i++) {
            const star = this.add.image(
                Phaser.Math.Between(100, 1350),
                Phaser.Math.Between(100, 850),
                'star'
            ).setScale(Phaser.Math.FloatBetween(0.1, 0.3))
             .setAlpha(Phaser.Math.FloatBetween(0.3, 0.6))
             .setTint(0x66aaff);

            this.tweens.add({
                targets: star,
                alpha: star.alpha * 0.3,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.particles.push(star);
        }

        // Rules container with dynamic styling
        const rulesContainer = this.add.rectangle(725, 475, 1000, 750, 0x001133, 0.9);
        rulesContainer.setStrokeStyle(5, 0x66aaff);
        
        const containerGlow = this.add.rectangle(725, 475, 1010, 760, 0x66aaff, 0.2);

        // Dynamic rules title
        const rulesTitle = this.add.text(725, 150, 'HOW TO PLAY', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#44ff66',
            stroke: '#000033',
            strokeThickness: 8,
            align: 'center',
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000033',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5);

        // Title pulse animation
        this.tweens.add({
            targets: rulesTitle,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Rules content with enhanced formatting (mobile-aware)
        const rulesText = this.isMobile ? [
            'MOBILE CONTROLS:',
            '• Touch LEFT/RIGHT arrows to move',
            '• Touch UP arrow to jump (double jump unlocks at level 2!)',
            '• Touch DOWN arrow to drop faster (unlocks at level 3!)',
            '• Touch B button for barrier (unlocks at level 5!)',
            '• Touch E button for EMP, S button for Sonic Boom',
            '',
            'GAMEPLAY:',
            '• Collect all stars to advance to the next level',
            '• Avoid the bouncing bombs at all costs!',
            '• More stars and bombs appear at higher levels',
            '',
            'PROGRESSION:',
            '• Choose abilities when you level up!',
            '• Level 2+: Double jump, Fast fall, etc.',
            '• Level 3+: Flying stars appear!',
            '• Level 4+: Triple jump becomes available',
            '• Level 5+: Magnetic barrier becomes available',
            '• Level 6+: Super speed becomes available',
            '• Higher levels: Faster bombs, more stars',
            '• Each star = 9 points',
            '',
            'LIVES:',
            '• Extra life every 200+ points (cost increases)',
            '• You get temporary invincibility after being hit',
            '• Game over when all lives are lost'
        ] : [
            'CONTROLS:',
            '• Use ARROW KEYS to move left and right',
            '• Press UP to jump (double jump unlocks at level 2!)',
            '• Press DOWN while falling to drop faster (unlocks at level 3!)',
            '• Press SPACE for magnetic barrier (unlocks at level 5!)',
            '',
            'GAMEPLAY:',
            '• Collect all stars to advance to the next level',
            '• Avoid the bouncing bombs at all costs!',
            '• More stars and bombs appear at higher levels',
            '',
            'PROGRESSION:',
            '• Choose abilities when you level up!',
            '• Level 2+: Double jump, Fast fall, etc.',
            '• Level 3+: Flying stars appear!',
            '• Level 4+: Triple jump becomes available',
            '• Level 5+: Magnetic barrier becomes available',
            '• Level 6+: Super speed becomes available',
            '• Higher levels: Faster bombs, more stars',
            '• Each star = 9 points',
            '',
            'LIVES:',
            '• Extra life every 200+ points (cost increases)',
            '• You get temporary invincibility after being hit',
            '• Game over when all lives are lost'
        ];

        let yPos = 230;
        rulesText.forEach(rule => {
            if (rule === '') {
                yPos += 15;
            } else {
                const isHeader = rule.endsWith(':');
                const textColor = isHeader ? '#ffff66' : '#ffffff';
                const fontSize = isHeader ? 18 : 16;
                const fontFamily = isHeader ? 'Arial Black' : 'Arial';
                
                this.add.text(725, yPos, rule, {
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    color: textColor,
                    stroke: '#000033',
                    strokeThickness: isHeader ? 3 : 2,
                    align: 'center',
                    shadow: isHeader ? {
                        offsetX: 2,
                        offsetY: 2,
                        color: '#000033',
                        blur: 4,
                        fill: true
                    } : undefined
                }).setOrigin(0.5);
            }
            yPos += 22;
        });

        // Enhanced back button
        this.createDynamicButton(725, 800, 'BACK TO MENU', '#ff4466', '#ff6688', () => {
            this.createDynamicMenu();
        });

        // Instructions
        this.add.text(725, 860, 'Press ESC to return', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#aaccff',
            stroke: '#000033',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ESC', () => {
            this.createDynamicMenu();
        });

        this.showingRules = true;
    }

    createCharacterSelection() {
        const centerX = 725; // Center on 1450px width
        const centerY = 580; // Position below Personal Best with better spacing

        // Character selection title
        this.add.text(centerX, centerY - 50, 'Choose Your Character:', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Character preview sprite using the idle frame (frame 4)
        const currentChar = this.characters[this.selectedCharacterIndex];
        this.characterSprite = this.add.sprite(centerX, centerY, currentChar.previewKey, currentChar.previewFrame)
            .setScale(currentChar.scale)
            .setOrigin(0.5);

        // Character label - better spacing below sprite
        this.characterLabel = this.add.text(centerX, centerY + 80, this.characters[this.selectedCharacterIndex].label, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Left arrow - better positioning
        this.leftArrow = this.add.text(centerX - 120, centerY, '<', {
            fontFamily: 'Arial Black',
            fontSize: 50,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive();

        // Right arrow - better positioning
        this.rightArrow = this.add.text(centerX + 120, centerY, '>', {
            fontFamily: 'Arial Black',
            fontSize: 50,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive();

        this.leftArrow.on('pointerdown', () => this.changeCharacter(-1));
        this.rightArrow.on('pointerdown', () => this.changeCharacter(1));

        // Keyboard support for character selection
        this.input.keyboard.on('keydown-LEFT', () => this.changeCharacter(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.changeCharacter(1));
    }

    changeCharacter(dir) {
        this.selectedCharacterIndex = (this.selectedCharacterIndex + dir + this.characters.length) % this.characters.length;
        
        // Update the character preview sprite with correct frame and scale
        const currentChar = this.characters[this.selectedCharacterIndex];
        this.characterSprite.setTexture(currentChar.previewKey, currentChar.previewFrame);
        this.characterSprite.setScale(currentChar.scale);
        this.characterLabel.setText(currentChar.label);
    }

    addDecorativeStars() {
        // Add some animated stars for decoration
        const starPositions = [
            {x: 150, y: 120}, {x: 1050, y: 140}, {x: 200, y: 650}, 
            {x: 1000, y: 630}, {x: 100, y: 400}, {x: 1100, y: 450}
        ];

        starPositions.forEach(pos => {
            let star = this.add.image(pos.x, pos.y, 'star').setScale(0.5);
            
            // Add a gentle floating animation
            this.tweens.add({
                targets: star,
                y: pos.y - 20,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Add a rotation animation
            this.tweens.add({
                targets: star,
                rotation: Math.PI * 2,
                duration: 4000,
                repeat: -1,
                ease: 'Linear'
            });
        });
    }

    createLowerSection(centerX) {
        // Character selection with full vertical spread
        const selectionY = 650;

        // Enhanced character selection background
        const selectionBg = this.add.rectangle(centerX, selectionY, 500, 180, 0x001133, 0.8);
        selectionBg.setStrokeStyle(4, 0x66aaff);

        // Character selection title
        const titleText = this.add.text(centerX, selectionY - 70, 'Choose Your Character:', {
            fontFamily: 'Arial Black',
            fontSize: 26,
            color: '#ffffff',
            stroke: '#000033',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                fill: true
            }
        }).setOrigin(0.5);

        // Character platform with enhanced design
        const charPlatform = this.add.rectangle(centerX, selectionY + 20, 140, 20, 0x336699);
        charPlatform.setStrokeStyle(3, 0x66aaff);

        // Main character sprite with glow
        const currentChar = this.characters[this.selectedCharacterIndex];
        this.characterSprite = this.add.sprite(centerX, selectionY - 5, currentChar.previewKey, currentChar.previewFrame)
            .setScale(currentChar.scale)
            .setOrigin(0.5);

        // Character glow effect
        this.characterGlow = this.add.circle(centerX, selectionY - 5, 70, 0x66aaff, 0.3);

        // Character label
        this.characterLabel = this.add.text(centerX, selectionY + 60, this.characters[this.selectedCharacterIndex].label, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffff66',
            stroke: '#000033',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 6,
                fill: true
            }
        }).setOrigin(0.5);

        // Enhanced arrow buttons
        this.createDynamicArrows(centerX, selectionY);

        // Character animations
        this.tweens.add({
            targets: this.characterSprite,
            y: selectionY - 15,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: this.characterGlow,
            alpha: 0.5,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.dynamicElements.push(selectionBg, titleText, charPlatform, this.characterGlow, this.characterLabel);
    }

    createDynamicArrows(centerX, selectionY) {
        // Left arrow with enhanced design
        this.leftArrow = this.add.container(centerX - 150, selectionY - 5);
        const leftBg = this.add.circle(0, 0, 30, 0x001133, 0.9);
        leftBg.setStrokeStyle(4, 0x66aaff);
        const leftGlow = this.add.circle(0, 0, 35, 0x66aaff, 0.2);
        const leftText = this.add.text(0, 0, '<', {
            fontFamily: 'Arial Black',
            fontSize: 40,
            color: '#ffffff',
            stroke: '#000033',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.leftArrow.add([leftGlow, leftBg, leftText]);
        this.leftArrow.setSize(60, 60).setInteractive();

        // Right arrow with matching design
        this.rightArrow = this.add.container(centerX + 150, selectionY - 5);
        const rightBg = this.add.circle(0, 0, 30, 0x001133, 0.9);
        rightBg.setStrokeStyle(4, 0x66aaff);
        const rightGlow = this.add.circle(0, 0, 35, 0x66aaff, 0.2);
        const rightText = this.add.text(0, 0, '>', {
            fontFamily: 'Arial Black',
            fontSize: 40,
            color: '#ffffff',
            stroke: '#000033',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.rightArrow.add([rightGlow, rightBg, rightText]);
        this.rightArrow.setSize(60, 60).setInteractive();

        // Arrow interactions
        this.setupArrowEffects(this.leftArrow, leftBg, leftGlow, -1);
        this.setupArrowEffects(this.rightArrow, rightBg, rightGlow, 1);

        // Arrow pulse animations
        this.tweens.add({
            targets: [leftGlow, rightGlow],
            alpha: 0.4,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.dynamicElements.push(this.leftArrow, this.rightArrow);
    }

    setupArrowEffects(arrow, bg, glow, direction) {
        arrow.on('pointerover', () => {
            this.tweens.add({
                targets: arrow,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 150,
                ease: 'Back.easeOut'
            });
            bg.setFillStyle(0x002244, 0.9);
            bg.setStrokeStyle(4, 0x88ccff);
            glow.setFillStyle(0x88ccff, 0.5);
        });

        arrow.on('pointerout', () => {
            this.tweens.add({
                targets: arrow,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 150,
                ease: 'Back.easeOut'
            });
            bg.setFillStyle(0x001133, 0.9);
            bg.setStrokeStyle(4, 0x66aaff);
            glow.setFillStyle(0x66aaff, 0.2);
        });

        arrow.on('pointerdown', () => this.changeCharacterDynamic(direction));
    }

    createBottomSection(centerX) {
        // Instructions at the bottom
        const instructionsY = 850;
        
        const instructions = this.add.text(centerX, instructionsY, 'Press SPACE to Start • H for Help • Arrow Keys to Select Character', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#aaccff',
            stroke: '#000033',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: instructions,
            alpha: 0.6,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.dynamicElements.push(instructions);
    }

    createDynamicAtmosphere() {
        // Enhanced particle system spanning the full height
        for (let i = 0; i < 40; i++) {
            const star = this.add.image(
                Phaser.Math.Between(50, 1400),
                Phaser.Math.Between(50, 900),
                'star'
            ).setScale(Phaser.Math.FloatBetween(0.1, 0.5))
             .setAlpha(Phaser.Math.FloatBetween(0.2, 0.8))
             .setTint(Phaser.Math.Between(0x6699ff, 0xffffff));

            // Complex twinkling animation
            this.tweens.add({
                targets: star,
                alpha: star.alpha * 0.1,
                scaleX: star.scaleX * 1.5,
                scaleY: star.scaleY * 1.5,
                duration: Phaser.Math.Between(2000, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 3000)
            });

            // Floating movement
            this.tweens.add({
                targets: star,
                x: star.x + Phaser.Math.Between(-30, 30),
                y: star.y + Phaser.Math.Between(-25, 25),
                duration: Phaser.Math.Between(8000, 15000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.particles.push(star);
        }

        // Add dynamic corner decorations
        this.createCornerDecorations();
    }

    createCornerDecorations() {
        const decorations = [
            {x: 100, y: 100, type: 'star', scale: 1.0, tint: 0x66aaff},
            {x: 1350, y: 100, type: 'star', scale: 1.0, tint: 0xff6699},
            {x: 100, y: 850, type: 'bomb', scale: 0.5, tint: 0x999999},
            {x: 1350, y: 850, type: 'bomb', scale: 0.5, tint: 0x999999}
        ];

        decorations.forEach((decoration, index) => {
            const sprite = this.add.image(decoration.x, decoration.y, decoration.type)
                .setScale(decoration.scale)
                .setAlpha(0.7)
                .setTint(decoration.tint);

            // Dynamic corner animations
            this.tweens.add({
                targets: sprite,
                y: decoration.y - 20,
                rotation: decoration.type === 'star' ? Math.PI * 2 : 0,
                duration: 3000 + (index * 1000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.dynamicElements.push(sprite);
        });
    }

    createButtonParticles(x, y, color) {
        for (let i = 0; i < 6; i++) {
            const particle = this.add.image(
                x + Phaser.Math.Between(-30, 30),
                y + Phaser.Math.Between(-15, 15),
                'star'
            ).setScale(0.15)
             .setAlpha(0.9)
             .setTint(parseInt(color.replace('#', '0x')));

            this.tweens.add({
                targets: particle,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                y: particle.y - 30,
                rotation: Math.PI * 2,
                duration: 1000,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    changeCharacterDynamic(direction) {
        this.selectedCharacterIndex = (this.selectedCharacterIndex + direction + this.characters.length) % this.characters.length;
        
        const currentChar = this.characters[this.selectedCharacterIndex];

        // Enhanced character transition
        this.tweens.add({
            targets: [this.characterSprite, this.characterGlow],
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            rotation: direction * Math.PI,
            duration: 250,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.characterSprite.setTexture(currentChar.previewKey, currentChar.previewFrame);
                this.characterSprite.setScale(currentChar.scale);
                this.characterSprite.setRotation(0);
                
                this.tweens.add({
                    targets: [this.characterSprite, this.characterGlow],
                    alpha: 1,
                    scaleX: currentChar.scale,
                    scaleY: currentChar.scale,
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            }
        });

        // Label transition
        this.tweens.add({
            targets: this.characterLabel,
            scaleY: 0,
            duration: 200,
            onComplete: () => {
                this.characterLabel.setText(currentChar.label);
                this.tweens.add({
                    targets: this.characterLabel,
                    scaleY: 1,
                    duration: 250,
                    ease: 'Back.easeOut'
                });
            }
        });

        // Create selection burst effect
        this.createSelectionBurst();
    }

    createSelectionBurst() {
        const centerX = 725;
        const centerY = 645;
        
        // Create explosive particle burst
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 80;
            const particle = this.add.image(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius,
                'star'
            ).setScale(0.4)
             .setAlpha(1)
             .setTint(0x66aaff);

            this.tweens.add({
                targets: particle,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                x: particle.x + Math.cos(angle) * 50,
                y: particle.y + Math.sin(angle) * 50,
                rotation: Math.PI * 3,
                duration: 800,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    setupMenuInteractions() {
        // Enhanced keyboard controls
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.showingRules) {
                this.registry.set('selectedCharacter', this.characters[this.selectedCharacterIndex].key);
                this.startGameTransition();
            }
        });

        this.input.keyboard.on('keydown-H', () => {
            if (!this.showingRules) {
                this.showRules();
            }
        });

        this.input.keyboard.on('keydown-LEFT', () => {
            if (!this.showingRules) {
                this.changeCharacterDynamic(-1);
            }
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            if (!this.showingRules) {
                this.changeCharacterDynamic(1);
            }
        });
    }

    startGameTransition() {
        console.log('Starting game transition...');
        // Epic transition effect
        const flash = this.add.rectangle(725, 475, 1450, 950, 0x66aaff, 0);
        
        this.tweens.add({
            targets: flash,
            alpha: 1,
            duration: 400,
            ease: 'Power3.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        console.log('Transitioning to Game scene...');
                        this.scene.start('Game');
                    }
                });
            }
        });
    }
}
