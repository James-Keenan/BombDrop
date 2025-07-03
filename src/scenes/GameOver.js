export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
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
            fontSize: 64, 
            color: '#ff4444',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Level reached display
        this.add.text(725, 290, 'Level Reached: ' + finalLevel, {
            fontFamily: 'Arial', 
            fontSize: 28, 
            color: '#00ff00',
            stroke: '#000000', 
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Score display
        this.add.text(725, 330, 'Final Score: ' + finalScore, {
            fontFamily: 'Arial', 
            fontSize: 32, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // High score display
        this.add.text(725, 370, 'Personal Best: ' + highScore, {
            fontFamily: 'Arial', 
            fontSize: 24, 
            color: '#ffff00',
            stroke: '#000000', 
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Highest level display
        this.add.text(725, 405, 'Highest Level: ' + highestLevel, {
            fontFamily: 'Arial', 
            fontSize: 24, 
            color: '#ff8800',
            stroke: '#000000', 
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(725, 470, 'Press SPACE to Return to Title Screen', {
            fontFamily: 'Arial', 
            fontSize: 24, 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Game Over text with mobile scaling
        this.add.text(this.cameras.main.centerX, 200, 'Game Over!', {
            fontSize: `${Math.floor(64 * textScale)}px`,
            fontFamily: 'Arial, sans-serif',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Score text with mobile scaling
        this.add.text(this.cameras.main.centerX, 300, `Final Score: ${finalScore}`, {
            fontSize: `${Math.floor(32 * textScale)}px`,
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Instructions with mobile scaling
        this.add.text(this.cameras.main.centerX, 400, 'Tap to continue', {
            fontSize: `${Math.floor(24 * textScale)}px`,
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00'
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
