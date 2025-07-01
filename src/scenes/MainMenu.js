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
        let bg = this.add.image(725, 475, 'sky');
        bg.setScale(1450 / bg.width, 950 / bg.height);

        // Game title - larger and better positioned
        this.add.text(725, 150, 'BombDrop', {
            fontFamily: 'Arial Black',
            fontSize: 88,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle - larger font and better spacing
        this.add.text(725, 220, 'Avoid the Bombs, Collect the Stars!', {
            fontFamily: 'Arial',
            fontSize: 30,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Menu buttons - better spacing for larger screen
        this.createButton(725, 340, 'START GAME', '#ff4444', () => {
            this.scene.start('Game');
        });

        this.createButton(725, 420, 'HOW TO PLAY', '#00ff00', () => {
            this.showRules();
        });

        // Display high score and highest level - moved down for better spacing
        const highScore = localStorage.getItem('highScore') || 0;
        const highestLevel = localStorage.getItem('highestLevel') || 1;
        
        this.add.text(725, 490, 'Personal Best: ' + highScore, {
            fontFamily: 'Arial',
            fontSize: 26,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(725, 525, 'Highest Level: ' + highestLevel, {
            fontFamily: 'Arial',
            fontSize: 26,
            color: '#ff8800',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Add keyboard instruction at bottom
        this.add.text(725, 570, 'Press SPACE to Start | Press H for How to Play', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 1,
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
        // Create button background - larger buttons for better visibility
        const buttonBg = this.add.rectangle(x, y, 320, 55, 0x000000, 0.7);
        buttonBg.setStrokeStyle(3, color);

        // Create button text
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial Black',
            fontSize: 26,
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
        let bg = this.add.image(725, 475, 'sky').setAlpha(0.7);
        bg.setScale(1450 / bg.width, 950 / bg.height);

        // Rules title
        this.add.text(725, 80, 'HOW TO PLAY', {
            fontFamily: 'Arial Black',
            fontSize: 52,
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

        let yPos = 125;
        rulesText.forEach(rule => {
            if (rule === '') {
                yPos += 10; // Extra spacing for empty lines
            } else {
                const textColor = rule.endsWith(':') ? '#ffff00' : '#ffffff';
                const fontSize = rule.endsWith(':') ? 16 : 15;
                
                this.add.text(725, yPos, rule, {
                    fontFamily: rule.endsWith(':') ? 'Arial Black' : 'Arial',
                    fontSize: fontSize,
                    color: textColor,
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                }).setOrigin(0.5);
            }
            yPos += 20;
        });

        // Back button - positioned at bottom
        this.createButton(725, 650, 'BACK TO MENU', '#ff4444', () => {
            this.createMainMenu();
        });

        // Keyboard shortcut instruction
        this.add.text(725, 700, 'Press ESC to go back', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5);

        // Keyboard shortcut
        this.input.keyboard.once('keydown-ESC', () => {
            this.createMainMenu();
        });

        this.showingRules = true;
    }

    addDecorativeStars() {
        // Add some animated stars for decoration - better positioned for 1450x950 screen
        const starPositions = [
            {x: 120, y: 120}, {x: 1330, y: 140}, {x: 180, y: 650}, 
            {x: 1270, y: 620}, {x: 80, y: 400}, {x: 1370, y: 450},
            {x: 200, y: 300}, {x: 1250, y: 320}
        ];

        starPositions.forEach(pos => {
            let star = this.add.image(pos.x, pos.y, 'star').setScale(0.6);
            
            // Add a gentle floating animation
            this.tweens.add({
                targets: star,
                y: pos.y - 25,
                duration: 2500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Add a rotation animation
            this.tweens.add({
                targets: star,
                rotation: Math.PI * 2,
                duration: 4500,
                repeat: -1,
                ease: 'Linear'
            });
        });
    }
}
