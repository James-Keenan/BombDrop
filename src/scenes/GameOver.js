export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        // Set a dark background
        this.cameras.main.setBackgroundColor(0x2c1810);

        // Add the sky background with reduced alpha
        let bg = this.add.image(600, 400, 'sky').setAlpha(0.3);
        bg.setScale(1200 / bg.width, 800 / bg.height);

        // Get the final score from the registry
        const finalScore = this.registry.get('finalScore') || 0;
        const highScore = localStorage.getItem('highScore') || 0;

        // Game Over title
        this.add.text(600, 250, 'Game Over', {
            fontFamily: 'Arial Black', 
            fontSize: 64, 
            color: '#ff4444',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Score display
        this.add.text(600, 330, 'Final Score: ' + finalScore, {
            fontFamily: 'Arial', 
            fontSize: 32, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // High score display
        this.add.text(600, 370, 'Personal Best: ' + highScore, {
            fontFamily: 'Arial', 
            fontSize: 24, 
            color: '#ffff00',
            stroke: '#000000', 
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(600, 470, 'Press SPACE to Play Again', {
            fontFamily: 'Arial', 
            fontSize: 24, 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(600, 500, 'Press ESC to Return to Menu', {
            fontFamily: 'Arial', 
            fontSize: 18, 
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        // Input handling
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Game');
        });

        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MainMenu');
        });

        // Also allow clicking to restart
        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
