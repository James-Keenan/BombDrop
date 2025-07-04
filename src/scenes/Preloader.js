export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        let bg = this.add.image(600, 400, 'background');
        bg.setScale(1200 / bg.width, 800 / bg.height);

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(600, 400, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(600 - 230, 400, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('sky', "sky.png");
        this.load.image('ground', "platform.png");
        this.load.image('star', "star.png");
        this.load.image('bomb', "bomb.png");

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
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
