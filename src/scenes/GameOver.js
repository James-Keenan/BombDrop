export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        // Hide mobile controller in GameOver scene
        if (window.hideMobileController) {
            window.hideMobileController();
        }
        
        // Set a dark background
        this.cameras.main.setBackgroundColor(0x2c1810);

        // Add the sky background with reduced alpha
        let bg = this.add.image(725, 475, 'sky').setAlpha(0.3);
        bg.setScale(1450 / bg.width, 950 / bg.height);

        // Get the final score and level from the registry
        const finalScore = this.registry.get('finalScore') || 0;
        const finalLevel = this.registry.get('finalLevel') || 1;
        const highScore = localStorage.getItem('highScore') || 0;
        const highestLevel = localStorage.getItem('highestLevel') || 1;

        const textScale = window.getMobileTextScale ? window.getMobileTextScale() : 1;

        // Game Over title
        this.add.text(725, 220, 'Game Over', {
            fontFamily: 'Arial Black', 
            fontSize: Math.floor(64 * textScale), 
            color: '#ff4444',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Level reached display
        this.add.text(725, 290, 'Level Reached: ' + finalLevel, {
            fontFamily: 'Arial', 
            fontSize: Math.floor(28 * textScale), 
            color: '#00ff00',
            stroke: '#000000', 
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Score display
        this.add.text(725, 330, 'Final Score: ' + finalScore, {
            fontFamily: 'Arial', 
            fontSize: Math.floor(32 * textScale), 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // High score display
        this.add.text(725, 370, 'Personal Best: ' + highScore, {
            fontFamily: 'Arial', 
            fontSize: Math.floor(24 * textScale), 
            color: '#ffff00',
            stroke: '#000000', 
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Highest level display
        this.add.text(725, 405, 'Highest Level: ' + highestLevel, {
            fontFamily: 'Arial', 
            fontSize: Math.floor(24 * textScale), 
            color: '#ff8800',
            stroke: '#000000', 
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(725, 470, 'Press SPACE to Return to Title Screen', {
            fontFamily: 'Arial', 
            fontSize: Math.floor(24 * textScale), 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Input handling - only space key to return to main menu
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainMenu');
        });

        // Also allow clicking to return to main menu
        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
