export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('sky', "sky.png");
        this.load.image('ground', "platform.png");
        this.load.image('star', "star.png");
        this.load.image('bomb', "bomb.png");

        // Load robot map assets
        this.load.image('robotmap', "robot map/robotmap.png");
        this.load.image('plateform', "robot map/plateform.png");
        this.load.image('robotground', "robot map/robotground.png");

        // Load map preview images for map select UI
        this.load.image('MapOne', "map photos/MapOne.png");
        this.load.image('robotMap', "map photos/robotMap.png");

        // Load dude spritesheet (32x48)
        this.load.spritesheet(
            'dude',
            "dude.png",
            { frameWidth: 32, frameHeight: 48 }
        );

        // Load cat and robot as regular images first for menu preview
        this.load.image('cat-preview', "cat.png");
        this.load.image('robot-preview', "robot.png");
        this.load.image('dude-preview', "dude.png");

        // Cat and Robot spritesheets
        this.load.spritesheet(
            'cat',
            "cat.png",
            { frameWidth: 540, frameHeight: 474 }
        );
        this.load.spritesheet(
            'robot',
            "robot.png",
            { frameWidth: 560, frameHeight: 474 }
        );
    }

    create() {
        // Use the same key as settings and main menu for username
        let playerName = localStorage.getItem('username');
        // If not set, prompt for username and store it
        if (!playerName) {
            playerName = prompt('Enter your username:', 'Player');
            if (playerName && playerName.trim().length > 0) {
                playerName = playerName.trim().slice(0, 16);
                localStorage.setItem('username', playerName);
            } else {
                playerName = 'Player';
                localStorage.setItem('username', playerName);
            }
        }
        this.showFakeLoadingBar(playerName);
    }

    showFakeLoadingBar(playerName) {
        // Personalized or generic welcome message
        const welcomeMsg = playerName
            ? `Welcome, ${playerName}!`
            : 'Welcome to BombDrop!';
        const welcomeText = this.add.text(725, 430, welcomeMsg, {
            fontFamily: 'Arial Black',
            fontSize: 36,
            color: '#00ffcc',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Loading game text below welcome
        const loadingText = this.add.text(725, 480, 'Loading game...', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Glowing yellow progress bar (behind everything)
        const glowBar = this.add.rectangle(725, 530, 400, 32, 0xffff33, 0.25).setOrigin(0.5);
        glowBar.setDepth(0);
        // Animate glow pulse
        this.tweens.add({
            targets: glowBar,
            alpha: { from: 0.25, to: 0.5 },
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        // Loading bar background (above glow)
        const barBg = this.add.rectangle(725, 530, 400, 32, 0x333333).setOrigin(0.5);
        barBg.setStrokeStyle(3, 0x00ffcc);
        barBg.setDepth(1);

        // Bomb sprite at the end of the bar (bigger)
        const bomb = this.add.image(925, 530, 'bomb').setOrigin(0.5).setScale(1.3);
        bomb.setDepth(3);

        // Star sprite at the start of the bar
        const star = this.add.image(525, 530, 'star').setOrigin(0.5).setScale(1.1);
        star.setDepth(4);

        // Animate the star moving from left to right to the bomb over 2 seconds
        this.tweens.add({
            targets: star,
            x: 925,
            duration: 2000,
            ease: 'Linear',
            onUpdate: (tween) => {
                // Star moves straight, no up/down, no spin
                const progress = (star.x - 525) / 400;
                star.y = 530;
                star.setScale(1.1);
                // Bomb shakes more as star gets closer
                bomb.x = 925 + Math.sin(progress * 20) * (progress * 10);
                bomb.y = 530 + Math.cos(progress * 30) * (progress * 7);
                bomb.angle = Math.sin(progress * 10) * (progress * 12);
                // Progress bar fill (glow effect)
                if (!star.progressBarFill) {
                    star.progressBarFill = this.add.rectangle(525, 530, 0, 20, 0xffff33, 0.7).setOrigin(0, 0.5).setDepth(2);
                }
                star.progressBarFill.width = (star.x - 525);
            },
            onComplete: () => {
                // Remove progress bar fill
                if (star.progressBarFill) star.progressBarFill.destroy();
                // More realistic explosion: flash, expanding shockwave, and firework particles
                // 1. Bright flash
                const flash = this.add.ellipse(925, 530, 80, 80, 0xffffcc, 0.85).setDepth(6);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    scale: 2.2,
                    duration: 120,
                    onComplete: () => flash.destroy()
                });
                // 2. Expanding shockwave ring
                const shockwave = this.add.graphics({ x: 925, y: 530 });
                shockwave.setDepth(6);
                shockwave.alpha = 0.5;
                let ringRadius = 0;
                this.tweens.addCounter({
                    from: 0,
                    to: 60,
                    duration: 200,
                    ease: 'Cubic.easeOut',
                    onUpdate: tween => {
                        ringRadius = tween.getValue();
                        shockwave.clear();
                        shockwave.lineStyle(8, 0xffffcc, 0.5 * (1 - ringRadius / 60));
                        shockwave.strokeCircle(0, 0, ringRadius);
                    },
                    onComplete: () => shockwave.destroy()
                });
                // 3. Firework burst: colored lines/particles with random length and fade
                const fireworkColors = [0xfff200, 0xff6600, 0xff00cc, 0x00eaff, 0x00ff00, 0xff0000, 0xffffff];
                const fireworkLines = [];
                for (let i = 0; i < 18; i++) {
                    const angle = (i / 18) * Math.PI * 2;
                    const color = fireworkColors[i % fireworkColors.length];
                    const line = this.add.graphics({ x: 925, y: 530 });
                    line.setDepth(7);
                    const baseLen = 18 + Math.random() * 10;
                    line.lineStyle(6, color, 1);
                    line.beginPath();
                    line.moveTo(0, 0);
                    line.lineTo(Math.cos(angle) * baseLen, Math.sin(angle) * baseLen);
                    line.strokePath();
                    fireworkLines.push({ line, angle, color, baseLen });
                }
                this.tweens.addCounter({
                    from: 1,
                    to: 2.4,
                    duration: 220,
                    ease: 'Cubic.easeOut',
                    onUpdate: tween => {
                        fireworkLines.forEach(({ line, angle, color, baseLen }) => {
                            line.clear();
                            line.lineStyle(6, color, 1);
                            line.beginPath();
                            line.moveTo(0, 0);
                            const len = baseLen * tween.getValue();
                            line.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
                            line.strokePath();
                            line.alpha = 1 - (tween.getValue() - 1) * 0.7;
                        });
                    },
                    onComplete: () => {
                        fireworkLines.forEach(({ line }) => line.destroy());
                        bomb.destroy();
                        star.destroy();
                        setTimeout(() => {
                            welcomeText.destroy();
                            loadingText.destroy();
                            barBg.destroy();
                            glowBar.destroy();
                            // After fake loading, proceed as before
                            if (!playerName) {
                                this.askForName();
                            } else {
                                this.scene.start('MainMenu');
                            }
                        }, 250);
                    }
                });
            }
        });
    }

    askForName() {
        // Add a simple background for the input UI (optional, can be removed for transparency)
        const bg = this.add.rectangle(725, 475, 700, 300, 0x1a0033, 0.95).setStrokeStyle(4, 0x00ffcc);
        const prompt = this.add.text(725, 400, 'Enter your name to start:', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Create DOM input
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 16;
        input.placeholder = 'Your Name';
        input.style.position = 'absolute';
        input.style.left = '50%';
        input.style.top = '52%';
        input.style.transform = 'translate(-50%, -50%)';
        input.style.fontSize = '2em';
        input.style.borderRadius = '10px';
        input.style.padding = '8px 16px';
        input.style.border = '2px solid #00ffcc';
        input.style.background = '#fff';
        input.style.color = '#1a0033';
        input.style.textAlign = 'center';
        input.style.zIndex = 1000;
        document.body.appendChild(input);

        const submitBtn = this.add.text(725, 500, 'Start Game', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#222'
        }).setOrigin(0.5).setInteractive();

        submitBtn.on('pointerdown', () => {
            const name = input.value.trim();
            if (name.length > 0) {
                localStorage.setItem('playerName', name);
                input.remove();
                bg.destroy();
                prompt.destroy();
                submitBtn.destroy();
                // After entering name, show loading bar with personalized welcome, then go to MainMenu
                this.showFakeLoadingBar(name);
            }
        });
    }

    showWelcome(name) {
        // (No longer used)
    }
}
