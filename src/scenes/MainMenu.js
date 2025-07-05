import mapOne from '../maps/mapOne.js';
import robotMap from '../maps/robotMap.js';
import { showPlayerSelect } from '../ui/playerSelect.js';
import { showMapSelect } from '../ui/mapSelect.js';
import { showSettings } from '../ui/settings.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
        this.characters = [
            { key: 'dude', label: 'Turnup', previewKey: 'dude', previewFrame: 4, scale: 2.5 },
            { key: 'cat', label: 'CATsby', previewKey: 'cat', previewFrame: 4, scale: 0.25 },
            { key: 'robot', label: 'Tekno', previewKey: 'robot', previewFrame: 4, scale: 0.25, quotes: [
                'Ctrl, Alt, Elite'
            ] }
        ];
        this.selectedCharacterIndex = 0;
        this.dynamicElements = [];
        this.particles = [];
        this.availableMaps = [
            {
                key: 'mapOne',
                label: "Turnup's Trail",
                data: mapOne,
                previewKey: 'MapOne', // must match loaded image key
            },
            {
                key: 'robotMap',
                label: "Tekno's Terminal",
                data: robotMap,
                previewKey: 'robotMap', // must match loaded image key
            }
        ];
        this.selectedMapIndex = 0;
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

        // Add settings button (classic gear icon)
        this.createSettingsButton();

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

        // MAP SELECTION UI (Y: 780)
        // (Handled by new Choose Map overlay and displayChosenMap)

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
        // Get username for good luck message
        this.goodLuckText = this.add.text(centerX, 340, `Good luck, ${localStorage.getItem('username') || 'Player'}!`, {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffff66',
            stroke: '#000',
            strokeThickness: 6,
            align: 'center',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        // Make the start button even bigger and lower it slightly
        const startButton = this.createDynamicButton(centerX, 440, 'START GAME', '#ff4466', '#ff6688', () => {
            console.log('Start button clicked!');
            this.registry.set('selectedCharacter', this.characters[this.selectedCharacterIndex].key);
            console.log('Selected character:', this.characters[this.selectedCharacterIndex].key);
            this.startGameTransition();
        });
        // Make the button visually even larger
        startButton.setScale(1.7, 1.45);

        // Add connecting energy between buttons (lowered to match new button position)
        const energyLine = this.add.rectangle(centerX, 510, 350, 4, 0x66aaff, 0.6);
        this.tweens.add({
            targets: energyLine,
            alpha: 0.2,
            scaleX: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // (Choose Player/Map buttons are now in the showcase UI)

        // Display chosen character and map side by side in a showcase UI, and keep it updated
        this.displayShowcase(centerX);
        this.updateShowcase = () => this.displayShowcase(centerX);

        this.dynamicElements.push(this.goodLuckText, startButton, energyLine);
    }


    displayShowcase(centerX) {
        // Helper for button creation inside showcase
        const createShowcaseButton = (x, y, text, primaryColor, hoverColor, callback) => {
            const btn = this.createDynamicButton(x, y, text, primaryColor, hoverColor, callback);
            this.showcaseGroup.add(btn);
            return btn;
        };
        // Remove previous showcase if any
        if (this.showcaseGroup) {
            if (this.showcaseGroup.list) {
                this.showcaseGroup.list.forEach(child => child.destroy());
            }
            this.showcaseGroup.destroy();
        }
        // Raise the showcase higher so it doesn't cover the choose buttons
        const y = 640;
        const char = this.characters[this.selectedCharacterIndex];
        const map = this.availableMaps[this.selectedMapIndex];

        // Create a container for all showcase elements
        this.showcaseGroup = this.add.container(0, 0);

        // Arcade-style neon panel (bigger, with border and bolts)
        const panelWidth = 900;
        const panelHeight = 270;
        const panel = this.add.rectangle(centerX, y, panelWidth, panelHeight, 0x0a0033, 0.98)
            .setStrokeStyle(10, 0x00ffd0)
            .setDepth(10);
        const panelGlow = this.add.rectangle(centerX, y, panelWidth + 30, panelHeight + 30, 0x00ffd0, 0.10)
            .setDepth(9);
        this.showcaseGroup.add([panelGlow, panel]);

        // Corner bolts (arcade look)
        const boltColor = 0xffff66;
        const boltRadius = 16;
        const boltOffsets = [
            [-panelWidth/2+30, -panelHeight/2+30],
            [panelWidth/2-30, -panelHeight/2+30],
            [-panelWidth/2+30, panelHeight/2-30],
            [panelWidth/2-30, panelHeight/2-30]
        ];
        boltOffsets.forEach(([dx, dy]) => {
            const bolt = this.add.circle(centerX + dx, y + dy, boltRadius, boltColor, 0.95).setStrokeStyle(4, 0x333333).setDepth(11);
            this.showcaseGroup.add(bolt);
        });

        // Fun background pattern (diagonal stripes)
        for (let i = -panelWidth/2 + 20; i < panelWidth/2 - 20; i += 40) {
            const stripe = this.add.rectangle(centerX + i, y, 18, panelHeight - 40, 0xffffff, 0.04).setAngle(25).setDepth(9);
            this.showcaseGroup.add(stripe);
        }

        // Animated sparkles
        for (let i = 0; i < 8; i++) {
            const sx = centerX + Phaser.Math.Between(-panelWidth/2+40, panelWidth/2-40);
            const sy = y + Phaser.Math.Between(-panelHeight/2+30, panelHeight/2-30);
            const sparkle = this.add.image(sx, sy, 'star').setScale(0.18).setAlpha(0.7).setDepth(12);
            this.tweens.add({
                targets: sparkle,
                alpha: 0.2,
                scale: 0.08,
                duration: Phaser.Math.Between(1200, 2200),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000),
                ease: 'Sine.easeInOut'
            });
            this.showcaseGroup.add(sparkle);
        }

        // Character panel (left)
        const charX = centerX - 260;
        const charPanel = this.add.rectangle(charX, y, 220, panelHeight-40, 0x222244, 0.92).setStrokeStyle(5, 0xffff66).setDepth(11);
        const charGlow = this.add.circle(charX, y, 80, 0xffff66, 0.18).setDepth(12);
        const charSprite = this.add.sprite(charX, y-10, char.previewKey, char.previewFrame)
            .setScale(char.scale * 1.7)
            .setOrigin(0.5)
            .setDepth(13);
        const charLabel = this.add.text(charX, y + 70, char.label, {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 32, color: '#ffff66', stroke: '#000', strokeThickness: 6, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(13);
        const p1Label = this.add.text(charX, y - 90, 'PLAYER', {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 22, color: '#00ffd0', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(13);
        this.showcaseGroup.add([charPanel, charGlow, charSprite, charLabel, p1Label]);
        // Choose Player button further below player panel
        createShowcaseButton(charX, y + 170, 'CHOOSE PLAYER', '#ffaa00', '#ffff66', () => {
            showPlayerSelect(this, this.characters, (chosenIdx) => {
                this.selectedCharacterIndex = chosenIdx;
                if (this.updateShowcase) this.updateShowcase();
            });
        });

        // Glowing VS badge (center, animated)
        const vsGlow = this.add.circle(centerX, y, 60, 0xff4466, 0.18).setDepth(13);
        const vsText = this.add.text(centerX, y, 'VS', {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 64, color: '#ffaa00', stroke: '#000', strokeThickness: 10, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 12, fill: true }
        }).setOrigin(0.5).setDepth(14);
        this.tweens.add({
            targets: vsGlow,
            alpha: 0.38,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.showcaseGroup.add([vsGlow, vsText]);

        // Map panel (right)
        const mapX = centerX + 260;
        const mapPanel = this.add.rectangle(mapX, y, 260, panelHeight-40, 0x223344, 0.92).setStrokeStyle(5, 0x00ffd0).setDepth(11);
        const mapGlow = this.add.circle(mapX, y, 90, 0x00ffd0, 0.18).setDepth(12);
        const mapSprite = this.add.image(mapX, y-10, map.previewKey)
            .setDisplaySize(260, 160)
            .setOrigin(0.5)
            .setDepth(13);
        const mapLabel = this.add.text(mapX, y + 70, map.label, {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 32, color: '#00ffd0', stroke: '#000', strokeThickness: 6, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(13);
        const arenaLabel = this.add.text(mapX, y - 90, 'ARENA', {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 22, color: '#ffaa00', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(13);
        this.showcaseGroup.add([mapPanel, mapGlow, mapSprite, mapLabel, arenaLabel]);
        // Choose Map button further below map panel
        createShowcaseButton(mapX, y + 170, 'CHOOSE MAP', '#00ffd0', '#00aaff', () => {
            showMapSelect(this, this.availableMaps, (chosenIdx) => {
                this.selectedMapIndex = chosenIdx;
                if (this.updateShowcase) this.updateShowcase();
            });
        });

        // Add to dynamicElements for cleanup
        this.dynamicElements.push(this.showcaseGroup);
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

    createSettingsButton() {
        // Top right corner, classic gear icon (SVG path or Unicode)
        const iconX = 1370;
        const iconY = 70;
        // Use Unicode gear ⚙️ or draw a custom gear
        const settingsBtn = this.add.text(iconX, iconY, '\u2699', {
            fontFamily: 'Arial Black', fontSize: 54, color: '#00ffd0', stroke: '#000', strokeThickness: 7
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        settingsBtn.on('pointerdown', () => {
            // Get username from localStorage or default
            const username = localStorage.getItem('username') || 'Player';
            showSettings(this, username, (newName) => {
                localStorage.setItem('username', newName);
                // Update UI with new username if good luck message exists
                if (this.goodLuckText) {
                    this.goodLuckText.setText(`Good luck, ${newName || 'Player'}!`);
                }
            });
        });
        // Subtle gear spin on hover
        settingsBtn.on('pointerover', () => {
            this.tweens.add({
                targets: settingsBtn,
                angle: 360,
                duration: 700,
                onComplete: () => settingsBtn.setAngle(0)
            });
        });
    }

    showRules() {
        // Clear existing content
        this.children.removeAll();
        this.particles = [];

        // Background
        let bg = this.add.image(725, 475, 'sky').setAlpha(0.95);
        bg.setScale(1450 / bg.width, 950 / bg.height);
        bg.setTint(0x88aaff);

        // Main container
        const rulesContainer = this.add.rectangle(725, 475, 1100, 800, 0x001133, 0.97);
        rulesContainer.setStrokeStyle(6, 0x44ff66);
        const containerGlow = this.add.rectangle(725, 475, 1120, 820, 0x44ff66, 0.08);

        // Title
        const rulesTitle = this.add.text(725, 110, 'HOW TO PLAY', {
            fontFamily: 'Arial Black',
            fontSize: 72,
            color: '#44ff66',
            stroke: '#000033',
            strokeThickness: 10,
            align: 'center',
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000033',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5);
        this.tweens.add({
            targets: rulesTitle,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Scrollable rules area
        const scrollArea = this.add.rectangle(725, 475, 900, 540, 0x002244, 0.93).setStrokeStyle(3, 0x44ff66);
        scrollArea.setOrigin(0.5);
        // Mask for scroll
        const maskShape = this.make.graphics({x:0, y:0, add:false});
        maskShape.fillRect(275, 205, 900, 540);
        const mask = maskShape.createGeometryMask();

        // Large, readable text content (grouped by section)
        const rulesSections = [
            {
                header: 'Quick Rules',
                lines: [
                    '• Move left/right, jump, and avoid bombs!',
                    '• Collect all stars to finish the level.',
                    '• Lose a life if you touch a bomb.',
                    '• Game over when all lives are lost.'
                ]
            },
            {
                header: 'Abilities',
                lines: [
                    'JUMP: Jump higher and unlock double/triple jump.',
                    'SPEED: Move faster.',
                    'FAST FALL: Drop quickly by pressing down.',
                    'SLOW BOMBS: Bombs move slower.',
                    'STAR MULTIPLIER: Each star is worth more points.',
                    'STAR MAGNET: Stars are pulled toward you.',
                    'LIFE REGEN: Slowly regain lost lives.',
                    'EXTRA LIFE: Gain an extra life.',
                    'BARRIER: Temporary shield (press W or tap B).',
                    'EMP: Destroy all bombs (press E or tap E).',
                    'SONIC BOOM: Throw a pulse grenade (press Q or tap S).',
                    'PLATFORM DROP: Drop through platforms.',
                    'TOKEN BONUS: Earn more tokens.',
                    'ZERO GRAVITY: Float for a short time (press R or tap Z).'
                ]
            },
            {
                header: 'Game Mechanics',
                lines: [
                    '• Level up by collecting all stars.',
                    '• Choose upgrades after each level.',
                    '• Earn tokens to buy upgrades.',
                    '• Special tokens unlock premium abilities.',
                    '• Each level gets harder: more bombs, more stars, faster action.'
                ]
            },
            {
                header: 'Controls',
                lines: this.isMobile ? [
                    'Touch arrows to move and jump.',
                    'Tap ability buttons to activate powers.'
                ] : [
                    'Arrow keys: Move',
                    'Up: Jump',
                    'Down: Fast fall',
                    'W: Barrier',
                    'E: EMP',
                    'Q: Sonic Boom',
                    'R: Zero Gravity',
                    'Space: Jump (alt)'
                ]
            }
        ];

        // Render all text into a container for scrolling
        const textContainer = this.add.container(275, 205);
        let y = 0;
        rulesSections.forEach(section => {
            const header = this.add.text(0, y, section.header, {
                fontFamily: 'Arial Black',
                fontSize: 44,
                color: '#ffff66',
                stroke: '#000',
                strokeThickness: 6
            });
            textContainer.add(header);
            y += 60;
            section.lines.forEach(line => {
                const lineText = this.add.text(0, y, line, {
                    fontFamily: 'Arial',
                    fontSize: 36,
                    color: '#ffffff',
                    stroke: '#000',
                    strokeThickness: 4
                });
                textContainer.add(lineText);
                y += 48;
            });
            y += 30;
        });
        textContainer.setMask(mask);

        // Scrollbar UI
        const scrollBarHeight = 540;
        const scrollBarY = 475;
        const scrollBarX = 1200;
        const barBg = this.add.rectangle(scrollBarX, scrollBarY, 18, scrollBarHeight, 0x003322, 0.7);
        const bar = this.add.rectangle(scrollBarX, scrollBarY - scrollBarHeight/2 + 40, 18, 80, 0x44ff66, 0.95).setInteractive();
        bar.setOrigin(0.5, 0);

        // Scroll logic
        let dragging = false;
        let dragOffsetY = 0;
        bar.on('pointerdown', (pointer) => {
            dragging = true;
            dragOffsetY = pointer.y - bar.y;
        });
        this.input.on('pointerup', () => { dragging = false; });
        this.input.on('pointermove', (pointer) => {
            if (dragging) {
                let newY = pointer.y - dragOffsetY;
                newY = Math.max(scrollBarY - scrollBarHeight/2, Math.min(scrollBarY + scrollBarHeight/2 - bar.height, newY));
                bar.y = newY;
                // Scroll text
                const scrollPercent = (bar.y - (scrollBarY - scrollBarHeight/2)) / (scrollBarHeight - bar.height);
                const maxScroll = Math.max(0, y - 540);
                textContainer.y = 205 - scrollPercent * maxScroll;
            }
        });

        // Mouse wheel scroll
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            let scroll = (bar.y - (scrollBarY - scrollBarHeight/2)) + deltaY * 0.2;
            scroll = Math.max(0, Math.min(scrollBarHeight - bar.height, scroll));
            bar.y = scrollBarY - scrollBarHeight/2 + scroll;
            const scrollPercent = scroll / (scrollBarHeight - bar.height);
            const maxScroll = Math.max(0, y - 540);
            textContainer.y = 205 - scrollPercent * maxScroll;
        });

        // Touch scroll (mobile)
        let lastPointerY = null;
        scrollArea.setInteractive();
        scrollArea.on('pointerdown', (pointer) => { lastPointerY = pointer.y; });
        scrollArea.on('pointerup', () => { lastPointerY = null; });
        scrollArea.on('pointermove', (pointer) => {
            if (lastPointerY !== null) {
                let dy = pointer.y - lastPointerY;
                lastPointerY = pointer.y;
                let scroll = (bar.y - (scrollBarY - scrollBarHeight/2)) - dy;
                scroll = Math.max(0, Math.min(scrollBarHeight - bar.height, scroll));
                bar.y = scrollBarY - scrollBarHeight/2 + scroll;
                const scrollPercent = scroll / (scrollBarHeight - bar.height);
                const maxScroll = Math.max(0, y - 540);
                textContainer.y = 205 - scrollPercent * maxScroll;
            }
        });

        // Back button
        this.createDynamicButton(725, 800, 'BACK TO MENU', '#ff4466', '#ff6688', () => {
            this.createDynamicMenu();
        });

        // Remove ESC to return text and ESC handler as requested

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
        // No-op: character selection UI is now handled by the Choose Player button/modal only.
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
        // Removed 'Press SPACE' instructions as requested

        // Add HOW TO PLAY button at the bottom, less prominent
        const howToPlayButton = this.add.container(centerX, 900);
        const btnBg = this.add.rectangle(0, 0, 220, 44, 0x003322, 0.7);
        btnBg.setStrokeStyle(2, 0x44ff66);
        const btnText = this.add.text(0, 0, 'HOW TO PLAY', {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#44ff66',
            stroke: '#001100',
            strokeThickness: 2,
            align: 'center',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000',
                blur: 2,
                fill: true
            }
        }).setOrigin(0.5);
        howToPlayButton.add([btnBg, btnText]);
        howToPlayButton.setSize(220, 44);
        howToPlayButton.setInteractive({ useHandCursor: true });
        howToPlayButton.on('pointerdown', () => {
            this.showRules();
        });
        // Subtle hover effect
        howToPlayButton.on('pointerover', () => {
            btnBg.setFillStyle(0x005533, 0.85);
            btnText.setColor('#66ff99');
        });
        howToPlayButton.on('pointerout', () => {
            btnBg.setFillStyle(0x003322, 0.7);
            btnText.setColor('#44ff66');
        });
        this.dynamicElements.push(howToPlayButton);
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

    // Removed old createMapSelectionUI and changeMap methods (now handled by overlay)

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
                        // Before starting the game, set the selected map in the registry
                        this.registry.set('selectedMap', this.availableMaps[this.selectedMapIndex].data);
                        this.scene.start('Game');
                    }
                });
            }
        });
    }
}
