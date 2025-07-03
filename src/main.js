import { Boot } from './scenes/Boot.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';

// Debug logging for mobile setup
console.log('Game initializing...');
console.log('Screen dimensions:', window.innerWidth, 'x', window.innerHeight);
console.log('User agent:', navigator.userAgent);

const config = {
    type: Phaser.AUTO,
    width: 1450,
    height: 950,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 500 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 240
        },
        max: {
            width: 2000,
            height: 1500
        },
        parent: 'game-container'
    },
    input: {
        activePointers: 5, // Support multi-touch for mobile devices
        touch: true,
        mouse: true
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver
    ]
};

console.log('Creating Phaser game with config:', config);
new Phaser.Game(config);
