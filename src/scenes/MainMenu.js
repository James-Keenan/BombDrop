import mapOne from '../maps/mapOne.js';
import robotMap from '../maps/robotMap.js';
import { catsbyCorner } from '../maps/catsbyCorner.js';
import { gabbiesGrave } from '../maps/gabbiesGrave.js';
import { peteStreet } from '../maps/peteStreet.js';
import { showPlayerSelect } from '../ui/playerSelect.js';
import { showMapSelect } from '../ui/mapSelect.js';
import { showSettings } from '../ui/settings.js';
import { getRandomQuote, showThoughtBubble } from '../ui/playerQuotes.js';
import { showAchievements } from '../ui/achievements.js';

export class MainMenu extends Phaser.Scene {
    // --- DIFFICULTY MODES ---
    static DIFFICULTY_LEVELS = [
        { key: 'easy', label: 'EASY', color: '#66ff99' },
        { key: 'normal', label: 'NORMAL', color: '#44aaff' },
        { key: 'expert', label: 'EXPERT', color: '#ff4466' }
    ];

    getCurrentDifficultyIndex() {
        const stored = localStorage.getItem('difficulty') || 'normal';
        const idx = MainMenu.DIFFICULTY_LEVELS.findIndex(d => d.key === stored);
        return idx === -1 ? 1 : idx;
    }

    setDifficulty(idx) {
        const diff = MainMenu.DIFFICULTY_LEVELS[idx];
        localStorage.setItem('difficulty', diff.key);
        this.registry.set('difficulty', diff.key);
        if (this.updateShowcase) this.updateShowcase();
    }
    constructor() {
        super('MainMenu');
        this.characters = [
            { key: 'random', label: '???', previewKey: 'question_mark', previewFrame: 0, scale: 2.5, isRandom: true, quotes: [
                'Who will it be?',
                'Mystery awaits!',
                'Feeling lucky?'
            ] },
            { key: 'dude', label: 'Turnup', previewKey: 'dude', previewFrame: 4, scale: 2.5, quotes: [
                'Let’s turn up the heat!',
                'Ready to roll!',
                'Stars are my jam!'
            ] },
            { key: 'cat', label: 'CATsby', previewKey: 'cat', previewFrame: 4, scale: 0.25, quotes: [
                'Purrfection in motion!',
                'Nine lives, one win!',
                'Meow or never!'
            ] },
            { key: 'robot', label: 'Tekno', previewKey: 'robot', previewFrame: 4, scale: 0.25, quotes: [
                'Ctrl, Alt, Elite',
                'System: Victory mode!',
                'Beep boop, let’s win!'
            ] },
            { key: 'zarazombie', label: 'Gabbie', previewKey: 'zarazombie', previewFrame: 4, scale: 0.25, quotes: [
                'Brains... or bombs?',
                'Zombies just want to have fun!',
                'Unstoppable Gabbie!',
                'I love the smell of bombs in the morning.'
            ] },
            { key: 'pluto', label: 'Pluto', previewKey: 'pluto', previewFrame: 4, scale: 0.25, quotes: [
                'Out of this world!',
                'Pluto power!',
                'Ready for launch!'
            ] },
            { key: 'pete', label: 'Pete', previewKey: 'pete', previewFrame: 4, scale: 0.12, quotes: [
                'Possum up!',
                'Night shift ready.',
                'Sneaky and speedy!'
            ] }
        ];
        this.selectedCharacterIndex = 0; // Default to random
        this.dynamicElements = [];
        this.particles = [];
        this.availableMaps = [
            { key: 'random', label: '???', data: null, previewKey: 'question_mark_map', isRandom: true },
            { key: 'mapOne', label: "Turnup's Trail", data: mapOne, previewKey: 'MapOne' },
            { key: 'catsbyCorner', label: "Catsby's Corner", data: catsbyCorner, previewKey: 'catBackground' },
            { key: 'robotMap', label: "Tekno's Terminal", data: robotMap, previewKey: 'robotMap' },
            { key: 'gabbiesGrave', label: "Gabbie's Grave", data: gabbiesGrave, previewKey: 'gabbies_grave_preview' },
            { key: 'peteStreet', label: "Pete's Street", data: peteStreet, previewKey: 'petesMap' }
        ];
        this.selectedMapIndex = 0; // Default to random
    }

    create() {
        // --- ACHIEVEMENT: Menu Explorer ---
        if (window.incrementAchievement) {
            window.incrementAchievement('menuOpened');
        } else if (this.incrementAchievement) {
            this.incrementAchievement('menuOpened');
        }
        // Only set default difficulty if not already set
        let storedDiff = localStorage.getItem('difficulty');
        if (!storedDiff || !['easy','normal','expert'].includes(storedDiff)) {
            storedDiff = 'normal';
            localStorage.setItem('difficulty', 'normal');
            this.registry.set('difficulty', 'normal');
        } else {
            // Use whatever is already set
            this.registry.set('difficulty', storedDiff);
        }
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

        // Add fullscreen toggle button (PC & mobile)
        this.createFullscreenButton();

        this.showingRules = false;
    }
    createFullscreenButton() {
        // Place button near the left, but slightly more to the right
        const x = 140, y = 60;
        const btn = this.add.text(x, y, '⛶', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffe066', stroke: '#000', strokeThickness: 6,
            backgroundColor: '#222', padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        btn.setDepth(1000);
        btn.on('pointerdown', () => {
            // Toggle fullscreen using the most robust method for mobile
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                // On mobile, use the browser's fullscreen API for the canvas itself (not parent)
                if (this.isMobile) {
                    const canvas = this.sys.game.canvas;
                    if (canvas.requestFullscreen) {
                        canvas.requestFullscreen();
                    } else if (canvas.webkitRequestFullscreen) {
                        canvas.webkitRequestFullscreen();
                    } else if (canvas.msRequestFullscreen) {
                        canvas.msRequestFullscreen();
                    } else {
                        // fallback to Phaser's API if available
                        this.scale.startFullscreen();
                    }
                } else {
                    this.scale.startFullscreen();
                }
                // Increment fullscreen achievement only when entering fullscreen
                if (window.incrementAchievement) {
                    window.incrementAchievement('fullscreen');
                } else if (this.incrementAchievement) {
                    this.incrementAchievement('fullscreen');
                }
            }
        });
        // Optional: Tooltip on hover
        btn.on('pointerover', () => {
            btn.setStyle({ color: '#fff', backgroundColor: '#444' });
        });
        btn.on('pointerout', () => {
            btn.setStyle({ color: '#ffe066', backgroundColor: '#222' });
        });
        // On mobile, make button larger and more touch-friendly
        if (this.isMobile) {
            btn.setFontSize(64);
            btn.setPadding({ left: 24, right: 24, top: 16, bottom: 16 });
        }
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

        // Personal Best container (wider, more padding, single-line text)
        const scoreContainer = this.add.container(centerX - 220, statsY);
        const scoreBg = this.add.rectangle(0, 0, 370, 70, 0x003366, 0.85);
        scoreBg.setStrokeStyle(3, 0x66aaff);
        
        const scoreIcon = this.add.image(-130, 0, 'star').setScale(0.7).setTint(0xffff66);
        // Increase text width and allow dynamic font size reduction
        let scoreFontSize = 26;
        const scoreText = this.add.text(0, 0, `Personal Best: ${highScore}`, {
            fontFamily: 'Arial Black',
            fontSize: scoreFontSize,
            color: '#ffffff',
            stroke: '#000033',
            strokeThickness: 4,
            align: 'center',
            fixedWidth: 310,
            maxLines: 1,
            wordWrap: false,
            overflow: 'hidden',
            padding: { left: 0, right: 0, top: 0, bottom: 0 }
        }).setOrigin(0.5);
        // Shrink font size until it fits
        while (scoreText.width > 310 && scoreFontSize > 14) {
            scoreFontSize -= 2;
            scoreText.setFontSize(scoreFontSize);
        }
        scoreContainer.add([scoreBg, scoreIcon, scoreText]);

        // Highest Level container (wider, more padding, single-line text)
        const levelContainer = this.add.container(centerX + 220, statsY);
        const levelBg = this.add.rectangle(0, 0, 370, 70, 0x663300, 0.85);
        levelBg.setStrokeStyle(3, 0xff9933);
        
        const levelIcon = this.add.image(-130, 0, 'bomb').setScale(0.4).setTint(0xff9933);
        let levelFontSize = 26;
        const levelText = this.add.text(0, 0, `Highest Level: ${highestLevel}`, {
            fontFamily: 'Arial Black',
            fontSize: levelFontSize,
            color: '#ffffff',
            stroke: '#330000',
            strokeThickness: 4,
            align: 'center',
            fixedWidth: 310,
            maxLines: 1,
            wordWrap: false,
            overflow: 'hidden',
            padding: { left: 0, right: 0, top: 0, bottom: 0 }
        }).setOrigin(0.5);
        while (levelText.width > 310 && levelFontSize > 14) {
            levelFontSize -= 2;
            levelText.setFontSize(levelFontSize);
        }
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



        // --- ACHIEVEMENTS, HOW TO PLAY (question mark), SETTINGS BUTTONS ---
        // Place Achievements, How To Play (question mark), and Settings in the top right
        const iconX = 1370;
        const iconY = 70;
        // Settings button (gear)
        const settingsBtn = this.add.text(iconX, iconY, '\u2699', {
            fontFamily: 'Arial Black', fontSize: 54, color: '#00ffd0', stroke: '#000', strokeThickness: 7
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        settingsBtn.on('pointerdown', () => {
            const username = localStorage.getItem('username') || 'Player';
            showSettings(this, username, (newName) => {
                localStorage.setItem('username', newName);
                if (this.goodLuckText) {
                    this.goodLuckText.setText(`Good luck, ${newName || 'Player'}!`);
                }
            });
        });
        settingsBtn.on('pointerover', () => {
            this.tweens.add({
                targets: settingsBtn,
                angle: 360,
                duration: 700,
                onComplete: () => settingsBtn.setAngle(0)
            });
        });

        // Achievements button (trophy icon)
        const achievementsBtn = this.add.text(iconX - 140, iconY, '\ud83c\udfc6', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffe066', stroke: '#b8860b', strokeThickness: 5
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        achievementsBtn.on('pointerdown', () => {
            showAchievements(this, (ach) => {
                // ...existing code for achievement progress...
                if (ach.type === 'stars') return parseInt(localStorage.getItem('totalStars') || '0', 10);
                if (ach.type === 'bombs_avoided') return parseInt(localStorage.getItem('bombsAvoided') || '0', 10);
                if (ach.type === 'level') return parseInt(localStorage.getItem('highestLevel') || '0', 10);
                if (ach.type === 'deaths') return parseInt(localStorage.getItem('deaths') || '0', 10);
                if (ach.type === 'wins') return parseInt(localStorage.getItem('wins') || '0', 10);
                if (ach.type === 'upgrades') return parseInt(localStorage.getItem('upgrades') || '0', 10);
                if (ach.type === 'tokens') return parseInt(localStorage.getItem('tokens') || '0', 10);
                if (ach.type === 'barrier') return parseInt(localStorage.getItem('barrier') || '0', 10);
                if (ach.type === 'emp') return parseInt(localStorage.getItem('emp') || '0', 10);
                if (ach.type === 'sonic') return parseInt(localStorage.getItem('sonic') || '0', 10);
                if (ach.type === 'platformDrop') return parseInt(localStorage.getItem('platformDrop') || '0', 10);
                if (ach.type === 'zeroGravity') return parseInt(localStorage.getItem('zeroGravity') || '0', 10);
                if (ach.type === 'catsbyUnlocked') return localStorage.getItem('catsbyUnlocked') === 'true' ? 1 : 0;
                if (ach.type === 'robotUnlocked') return localStorage.getItem('robotUnlocked') === 'true' ? 1 : 0;
                if (ach.type === 'gabbiePlayed') return localStorage.getItem('gabbiePlayed') === 'true' ? 1 : 0;
                if (ach.type === 'gabbiesGravePlayed') return localStorage.getItem('gabbiesGravePlayed') === 'true' ? 1 : 0;
                // ...add more as needed
                return 0;
            });
        });
        achievementsBtn.on('pointerover', () => { achievementsBtn.setColor('#fff799'); });
        achievementsBtn.on('pointerout', () => { achievementsBtn.setColor('#ffe066'); });
        this.dynamicElements.push(settingsBtn);
        this.dynamicElements.push(achievementsBtn);

        // HOW TO PLAY button (question mark icon)
        const howToPlayBtn = this.add.text(iconX - 70, iconY, '?', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#44ff66', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        howToPlayBtn.on('pointerdown', () => {
            this.showRules();
        });
        howToPlayBtn.on('pointerover', () => { howToPlayBtn.setColor('#fff799'); });
        howToPlayBtn.on('pointerout', () => { howToPlayBtn.setColor('#44ff66'); });
        this.dynamicElements.push(howToPlayBtn);

        // DIFFICULTY button (centered, below good luck message)
        const diffIdx = this.getCurrentDifficultyIndex();
        const diff = MainMenu.DIFFICULTY_LEVELS[diffIdx];
        const diffBtn = this.createDynamicButton(centerX, 410, `DIFFICULTY: ${diff.label}`, diff.color, '#fff799', () => {
        // Always get the current difficulty index from storage, not closure
        const currentIdx = this.getCurrentDifficultyIndex();
        let nextIdx = (currentIdx + 1) % MainMenu.DIFFICULTY_LEVELS.length;
        this.setDifficulty(nextIdx);
        // Update button label and color immediately
        const newDiff = MainMenu.DIFFICULTY_LEVELS[nextIdx];
        // Find the buttonText child (Phaser.Text) and update it
        const btnTextObj = diffBtn.list.find(child => child.setText && child.text && child.text.startsWith('DIFFICULTY:'));
        if (btnTextObj) {
            btnTextObj.setText(`DIFFICULTY: ${newDiff.label}`);
            btnTextObj.setColor(newDiff.color);
        }
        // Update button border and glow color
        const buttonBg = diffBtn.list.find(child => child.setStrokeStyle);
        if (buttonBg) buttonBg.setStrokeStyle(4, newDiff.color);
        const outerGlow = diffBtn.list.find(child => child.width && child.height && child.fillAlpha !== undefined);
        if (outerGlow) outerGlow.setFillStyle(parseInt(newDiff.color.replace('#', '0x')), 0.2);
    });
    diffBtn.setScale(1.1, 1.1);
    this.dynamicElements.push(diffBtn);

        // Place START GAME button at the bottom, styled green
        const startButton = this.createDynamicButton(centerX, 900, 'START GAME', '#44ff66', '#66ff99', () => {
            console.log('Start button clicked!');
            this.registry.set('selectedCharacter', this.characters[this.selectedCharacterIndex].key);
            console.log('Selected character:', this.characters[this.selectedCharacterIndex].key);
            this.startGameTransition();
        });
        startButton.setScale(2, 1.5);

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
        // Raise the showcase so it does not intersect with START GAME
        const y = 700;
        let char = this.characters[this.selectedCharacterIndex];
        let map = this.availableMaps[this.selectedMapIndex];

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

        // Center the Choose Player/Map buttons between HOW TO PLAY and the showcase
        // HOW TO PLAY is at y=410, showcase top is y-135 (645-135=510)
        // Lower the buttons slightly more to avoid overlap with HOW TO PLAY
        const chooseBtnY = 495;
        const charX = centerX - 260;
        createShowcaseButton(charX, chooseBtnY, 'CHOOSE PLAYER', '#ffaa00', '#ffff66', () => {
            showPlayerSelect(this, this.characters, (chosenIdx) => {
                this.selectedCharacterIndex = chosenIdx;
                if (this.updateShowcase) this.updateShowcase();
                // Show a new quote bubble for the newly selected player
                if (this.thoughtBubble) this.thoughtBubble.destroy();
                const char = this.characters[chosenIdx];
                const charKey = char.key === 'random' ? null : char.key;
                if (charKey) {
                    const quote = getRandomQuote(charKey);
                    if (quote) {
                        const bubbleX = charX + 90;
                        const bubbleY = y - 120;
                        this.thoughtBubble = showThoughtBubble(this, bubbleX, bubbleY, quote);
                        this.thoughtBubble.setDepth(20);
                    }
                }
            });
        });
        // Character panel (left)
        const charPanel = this.add.rectangle(charX, y, 220, panelHeight-40, 0x222244, 0.92).setStrokeStyle(5, 0xffff66).setDepth(11);
        const charGlow = this.add.circle(charX, y, 80, 0xffff66, 0.18).setDepth(12);
        let charSprite;
        if (char.isRandom) {
            charSprite = this.add.image(charX, y-10, 'question_mark')
                .setDisplaySize(120, 120)
                .setOrigin(0.5)
                .setDepth(13);
        } else {
            // For Zara, offset the sprite only (not the label) to visually center with her name
            let spriteX = charX;
            if (char.key === 'zarazombie') {
                spriteX = charX + 22; // Adjust this value as needed for perfect centering
            }
            charSprite = this.add.sprite(spriteX, y-10, char.previewKey, char.previewFrame)
                .setScale(char.scale * 1.7)
                .setOrigin(0.5)
                .setDepth(13);
        }
        // Always center the label at charX, not spriteX, so the name is centered in the slot
        const charLabel = this.add.text(charX, y + 70, char.label, {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 32, color: '#ffff66', stroke: '#000', strokeThickness: 6, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(13);
        const p1Label = this.add.text(charX, y - 90, 'PLAYER', {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 22, color: '#00ffd0', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(13);
        this.showcaseGroup.add([charPanel, charGlow, charSprite, charLabel, p1Label]);

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

        // Choose Map button, also centered
        const mapX = centerX + 260;
        createShowcaseButton(mapX, chooseBtnY, 'CHOOSE MAP', '#00ffd0', '#00aaff', () => {
            showMapSelect(this, this.availableMaps, (chosenIdx) => {
                this.selectedMapIndex = chosenIdx;
                if (this.updateShowcase) this.updateShowcase();
            });
        });
        // Map panel (right)
        const mapPanel = this.add.rectangle(mapX, y, 260, panelHeight-40, 0x223344, 0.92).setStrokeStyle(5, 0x00ffd0).setDepth(11);
        const mapGlow = this.add.circle(mapX, y, 90, 0x00ffd0, 0.18).setDepth(12);
        let mapSprite;
        if (map.isRandom) {
            mapSprite = this.add.image(mapX, y-10, 'question_mark_map')
                .setDisplaySize(180, 120)
                .setOrigin(0.5)
                .setDepth(13);
        } else {
            mapSprite = this.add.image(mapX, y-10, map.previewKey)
                .setDisplaySize(260, 160)
                .setOrigin(0.5)
                .setDepth(13);
        }
        const mapLabel = this.add.text(mapX, y + 70, map.label, {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 32, color: '#00ffd0', stroke: '#000', strokeThickness: 6, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(13);
        const arenaLabel = this.add.text(mapX, y - 90, 'ARENA', {
            fontFamily: 'ArcadeClassic, Arial Black', fontSize: 22, color: '#ffaa00', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(13);
        this.showcaseGroup.add([mapPanel, mapGlow, mapSprite, mapLabel, arenaLabel]);

        // Add to dynamicElements for cleanup
        this.dynamicElements.push(this.showcaseGroup);
    }

    createDynamicButton(x, y, text, primaryColor, hoverColor, callback) {
        const container = this.add.container(x, y);

        // Make CHOOSE PLAYER and CHOOSE MAP buttons bigger
        const isShowcaseButton = text === 'CHOOSE PLAYER' || text === 'CHOOSE MAP';
        const width = isShowcaseButton ? 420 : 350;
        const height = isShowcaseButton ? 80 : 60;
        const outerGlow = this.add.rectangle(0, 0, width + 20, height + 10, parseInt(primaryColor.replace('#', '0x')), 0.2);
        const buttonBg = this.add.rectangle(0, 0, width, height, 0x001133, 0.9);
        buttonBg.setStrokeStyle(4, primaryColor);
        const innerHighlight = this.add.rectangle(0, -2, width - 10, 3, parseInt(primaryColor.replace('#', '0x')), 0.8);

        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black',
            fontSize: isShowcaseButton ? 36 : 28,
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
        container.setSize(width, height);
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
        // Thicker scroll bar for mobile and desktop thumb usability
        const barWidth = this.isMobile ? 80 : 56;
        const barThumbHeight = this.isMobile ? 200 : 150;
        const barBg = this.add.rectangle(scrollBarX, scrollBarY, barWidth, scrollBarHeight, 0x003322, 0.7);
        const bar = this.add.rectangle(scrollBarX, scrollBarY - scrollBarHeight/2 + 40, barWidth, barThumbHeight, 0x44ff66, 0.95).setInteractive({ draggable: true });
        bar.setOrigin(0.5, 0);

        // Make the bar draggable by pointerdown and drag events (for both mouse and touch)
        bar.on('pointerdown', (pointer) => {
            dragging = true;
            dragOffsetY = pointer.y - bar.y;
        });
        bar.on('drag', (pointer, dragX, dragY) => {
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
        // Shift Zara and Pluto to the right for better centering
        let charX = centerX;
        if (currentChar.key === 'zarazombie') {
            charX = centerX + 36;
        } else if (currentChar.key === 'pluto') {
            charX = centerX + 90;
        }
        this.characterSprite = this.add.sprite(charX, centerY, currentChar.previewKey, currentChar.previewFrame)
            .setScale(currentChar.scale)
            .setOrigin(0.5);

        // Character label - always centered under the main centerX
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
        // Update the character preview sprite with correct frame and scale, and move Pluto's sprite to the right
        const currentChar = this.characters[this.selectedCharacterIndex];
        let charX = 725;
        if (currentChar.key === 'zarazombie') {
            charX = 725 + 36;
        } else if (currentChar.key === 'pluto') {
            charX = 725 + 90;
        }
        this.characterSprite.setTexture(currentChar.previewKey, currentChar.previewFrame);
        this.characterSprite.setScale(currentChar.scale);
        this.characterSprite.setX(charX);
        this.characterLabel.setText(currentChar.label);
        this.characterLabel.setX(725);
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
        // (Removed old HOW TO PLAY button at the bottom)
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
        // Move Pluto and Zara to the right, keep label centered
        let charX = 725;
        if (currentChar.key === 'zarazombie') {
            charX = 725 + 36;
        } else if (currentChar.key === 'pluto') {
            charX = 725 + 90;
        }

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
                this.characterSprite.setX(charX);
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
                this.characterLabel.setX(725);
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
        // Handle random player and map selection, but only pick from unlocked
        let charIdx = this.selectedCharacterIndex;
        let mapIdx = this.selectedMapIndex;
        if (this.characters[charIdx].isRandom) {
            // Only pick from unlocked characters (skip index 0, and locked ones)
            const unlockedCharIndices = this.characters
                .map((c, idx) => ({c, idx}))
                .filter(({c, idx}) => !c.isRandom && (
                    c.key === 'dude' ||
                    (c.key === 'cat' && localStorage.getItem('catsbyUnlocked') === 'true') ||
                    (c.key === 'robot' && localStorage.getItem('robotUnlocked') === 'true')
                ))
                .map(({idx}) => idx);
            if (unlockedCharIndices.length > 0) {
                charIdx = unlockedCharIndices[Phaser.Math.Between(0, unlockedCharIndices.length - 1)];
            } else {
                charIdx = 1; // fallback to Turnup
            }
        }
        if (this.availableMaps[mapIdx].isRandom) {
            // Only pick from unlocked maps (skip index 0, and locked ones)
            const unlockedMapIndices = this.availableMaps
                .map((m, idx) => ({m, idx}))
                .filter(({m, idx}) => !m.isRandom && (
                    m.key === 'mapOne' ||
                    (m.key === 'catsbyCorner' && localStorage.getItem('catsbyCornerUnlocked') === 'true') ||
                    (m.key === 'robotMap' && localStorage.getItem('robotMapUnlocked') === 'true')
                ))
                .map(({idx}) => idx);
            if (unlockedMapIndices.length > 0) {
                mapIdx = unlockedMapIndices[Phaser.Math.Between(0, unlockedMapIndices.length - 1)];
            } else {
                mapIdx = 1; // fallback to Turnup's Trail
            }
        }
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
                        // Set the selected character and map in the registry
                        this.registry.set('selectedCharacter', this.characters[charIdx].key);
                        // Also set the map key in the registry for per-map stats
                        this.registry.set('selectedMap', this.availableMaps[mapIdx].data);
                        if (this.availableMaps[mapIdx].key) {
                            this.registry.set('selectedMapKey', this.availableMaps[mapIdx].key);
                        }
                        this.scene.start('Game');
                    }
                });
            }
        });
    }
}
