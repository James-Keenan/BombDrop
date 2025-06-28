export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.showingRules = false; // Track if rules are currently visible
        this.createMainMenu();
    }

    createMainMenu() {
        // Clear any existing content
        this.children.removeAll();

        // Add background
        let bg = this.add.image(600, 400, 'sky');
        bg.setScale(1200 / bg.width, 800 / bg.height);

        // Game title
        this.add.text(600, 200, 'BombDrop', {
            fontFamily: 'Arial Black',
            fontSize: 72,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(600, 250, 'Avoid the Bombs, Collect the Stars!', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Menu buttons
        this.createButton(600, 350, 'START GAME', '#ff4444', () => {
            this.scene.start('Game');
        });

        this.createButton(600, 410, 'HOW TO PLAY', '#00ff00', () => {
            this.showRules();
        });

        // Display high score directly on main menu
        const highScore = localStorage.getItem('highScore') || 0;
        this.add.text(600, 470, 'Personal Best: ' + highScore, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Add some decorative stars
        this.addDecorativeStars();

        // Input handling for keyboard shortcuts
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Game');
        });

        this.input.keyboard.once('keydown-H', () => {
            this.showRules();
        });

        this.showingRules = false;
    }

    createButton(x, y, text, color, callback) {
        // Create button background
        const buttonBg = this.add.rectangle(x, y, 300, 50, 0x000000, 0.7);
        buttonBg.setStrokeStyle(3, color);

        // Create button text
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: color,
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Make button interactive
        buttonBg.setInteractive();
        buttonText.setInteractive();

        // Hover effects
        const hoverIn = () => {
            buttonBg.setFillStyle(0x333333, 0.9);
            buttonText.setScale(1.1);
        };

        const hoverOut = () => {
            buttonBg.setFillStyle(0x000000, 0.7);
            buttonText.setScale(1.0);
        };

        buttonBg.on('pointerover', hoverIn);
        buttonBg.on('pointerout', hoverOut);
        buttonText.on('pointerover', hoverIn);
        buttonText.on('pointerout', hoverOut);

        // Click events
        buttonBg.on('pointerdown', callback);
        buttonText.on('pointerdown', callback);

        return { bg: buttonBg, text: buttonText };
    }

    showRules() {
        // Clear existing content
        this.children.removeAll();

        // Add background
        let bg = this.add.image(600, 400, 'sky').setAlpha(0.7);
        bg.setScale(1200 / bg.width, 800 / bg.height);

        // Rules title
        this.add.text(600, 100, 'HOW TO PLAY', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Rules text
        const rulesText = [
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
            '• Level 2: Double jump unlocked!',
            '• Level 3: Fast fall & flying stars!',
            '• Level 4: Triple jump unlocked!',
            '• Level 5: Magnetic barrier unlocked!',
            '• Higher levels: Faster bombs, more stars',
            '• Each star = 9 points',
            '',
            'LIVES:',
            '• Extra life every 200+ points (cost increases)',
            '• You get temporary invincibility after being hit',
            '• Game over when all lives are lost'
        ];

        let yPos = 140;
        rulesText.forEach(rule => {
            if (rule === '') {
                yPos += 8; // Extra spacing for empty lines
            } else {
                const textColor = rule.endsWith(':') ? '#ffff00' : '#ffffff';
                const fontSize = rule.endsWith(':') ? 14 : 14;
                
                this.add.text(600, yPos, rule, {
                    fontFamily: rule.endsWith(':') ? 'Arial Black' : 'Arial',
                    fontSize: fontSize,
                    color: textColor,
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                }).setOrigin(0.5);
            }
            yPos += 18;
        });

        // Back button - moved higher now that text is more compact
        this.createButton(600, 600, 'BACK TO MENU', '#ff4444', () => {
            this.createMainMenu();
        });

        // Keyboard shortcut
        this.input.keyboard.once('keydown-ESC', () => {
            this.createMainMenu();
        });

        this.showingRules = true;
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
}
