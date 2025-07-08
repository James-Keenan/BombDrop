import { getClosestAchievements } from '../ui/achievements.js';
export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        // Hide mobile controller in GameOver scene
        if (window.hideMobileController) {
            window.hideMobileController();
        }
        // Fun, dark background
        this.cameras.main.setBackgroundColor(0x2c1810);
        let bg = this.add.image(725, 475, 'sky').setAlpha(0.4);
        bg.setScale(1450 / bg.width, 950 / bg.height);

        // Add animated stars for fun
        for (let i = 0; i < 18; i++) {
            const star = this.add.image(
                Phaser.Math.Between(80, 1370),
                Phaser.Math.Between(60, 890),
                'star'
            ).setScale(Phaser.Math.FloatBetween(0.18, 0.38))
             .setAlpha(Phaser.Math.FloatBetween(0.3, 0.7))
             .setTint(Phaser.Math.Between(0x6699ff, 0xffffff));
            this.tweens.add({
                targets: star,
                alpha: star.alpha * 0.2,
                scaleX: star.scaleX * 1.5,
                scaleY: star.scaleY * 1.5,
                duration: Phaser.Math.Between(1800, 3500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }

        // Get info from registry/localStorage
        const finalScore = this.registry.get('finalScore') || 0;
        const finalLevel = this.registry.get('finalLevel') || 1;
        const highScore = localStorage.getItem('highScore') || 0;
        const highestLevel = localStorage.getItem('highestLevel') || 1;
        const unlockedChar = this.registry.get('unlockedCharacter');
        let unlockedMap = this.registry.get('unlockedMap');
        const user = localStorage.getItem('username') || 'Player';
        // Try to get earned achievements (if tracked)
        let achievements = [];
        if (window.earnedAchievements && Array.isArray(window.earnedAchievements)) {
            achievements = window.earnedAchievements;
        } else {
            try {
                const data = localStorage.getItem('earnedAchievements');
                if (data) achievements = JSON.parse(data);
            } catch (e) {}
        }

        // Fun Game Over title
        this.add.text(725, 120, 'Game Over!', {
            fontFamily: 'Arial Black', fontSize: 72, color: '#ff4466', stroke: '#000', strokeThickness: 12, align: 'center',
            shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 16, fill: true }
        }).setOrigin(0.5);
        this.add.text(725, 200, `Better luck next time, ${user}!`, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#fff', stroke: '#000', strokeThickness: 7, align: 'center'
        }).setOrigin(0.5);

        // Final stats
        this.add.text(725, 260, `Level Reached: ${finalLevel}    Final Score: ${finalScore}`, {
            fontFamily: 'Arial', fontSize: 30, color: '#fff', stroke: '#000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);
        this.add.text(725, 300, `Personal Best: ${highScore}    Highest Level: ${highestLevel}`, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffff00', stroke: '#000', strokeThickness: 3, align: 'center'
        }).setOrigin(0.5);

        // Achievements earned (if any)
        this.add.text(725, 360, 'Achievements This Run:', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffe066', stroke: '#000', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5);
        if (achievements.length > 0) {
            achievements.forEach((ach, i) => {
                this.add.text(725, 410 + i * 32, `• ${ach.name}${ach.tier ? ' ' + ach.tier : ''}`, {
                    fontFamily: 'Arial', fontSize: 24, color: '#fff', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
            });
        } else {
            // Show 3 closest achievements if none earned
            const closest = getClosestAchievements();
            if (closest.length > 0) {
                this.add.text(725, 410, 'Closest Achievements:', {
                    fontFamily: 'Arial', fontSize: 24, color: '#fff', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
                closest.forEach((ach, i) => {
                    const progress = window.getProgress(ach);
                    this.add.text(725, 450 + i * 32, `• ${ach.name} (${progress}/${ach.goal})`, {
                        fontFamily: 'Arial', fontSize: 22, color: '#cccccc', stroke: '#000', strokeThickness: 2
                    }).setOrigin(0.5);
                });
            } else {
                this.add.text(725, 410, 'No achievements earned this run.', {
                    fontFamily: 'Arial', fontSize: 24, color: '#fff', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
            }
        }

        // Showcase unlocked character or map (if any)
        // Show all unlocked characters and maps in a single horizontal row (multi-unlock support)
        let showcaseY = 600;
        const unlockedCharacters = this.registry.get('unlockedCharacters') || [];
        const unlockedMaps = this.registry.get('unlockedMaps') || [];
        // Merge all unlocks into a single array, preserving type for badge
        const allUnlocks = [
            ...unlockedCharacters.map(char => ({
                ...char,
                label: char.key === 'cat' ? 'CATsby' :
                       char.key === 'zarazombie' ? 'Zara' :
                       char.key === 'pluto' ? 'Pluto' : char.label,
                previewKey: char.key === 'cat' ? (char.previewKey || 'cat') :
                            char.key === 'zarazombie' ? 'zara' :
                            char.key === 'pluto' ? 'pluto' : (char.previewKey || char.key),
                _unlockType: 'character'
            })),
            ...unlockedMaps.map(map => ({...map, _unlockType: 'map'}))
        ];
        if (allUnlocks.length > 0) {
            // Calculate spacing to fit all unlocks in a single row
            const maxWidth = 1450; // screen width
            const minSpacing = 320;
            const spacing = Math.min(minSpacing, Math.floor(maxWidth / Math.max(1, allUnlocks.length)));
            const totalWidth = (allUnlocks.length - 1) * spacing;
            const startX = 725 - totalWidth / 2;
            allUnlocks.forEach((unlock, i) => {
                const x = startX + i * spacing;
                let badgeText = unlock._unlockType === 'character' ? 'New Character Unlocked!' : 'New Map Unlocked!';
                let badgeColor = unlock._unlockType === 'character' ? '#66aaff' : '#ff8844';
                this.add.text(x, showcaseY - 120, badgeText, {
                    fontFamily: 'Arial Black', fontSize: 40, color: badgeColor, stroke: '#000', strokeThickness: 7
                }).setOrigin(0.5);
                if (unlock._unlockType === 'character') {
                    this.add.image(x, showcaseY + 40, unlock.previewKey || unlock.key)
                        .setDisplaySize(260, 260).setOrigin(0.5).setDepth(10);
                } else {
                    let mapPreviewKey = unlock.previewKey || unlock.key;
                    if (unlock.key === 'catsbyCorner' || unlock.label === "Catsby's Corner") {
                        mapPreviewKey = 'catBackground';
                    } else if (unlock.key === 'robotMap' || unlock.label === "Tekno's Robot Map") {
                        mapPreviewKey = 'robotMap';
                    } else if (unlock.key === 'gabbiesGrave' || unlock.label === "Gabbie's Grave") {
                        mapPreviewKey = 'zara background';
                    } else if (unlock.key === 'peteStreet' || unlock.label === "Pete's Street") {
                        mapPreviewKey = 'petesMap';
                    }
                    this.add.image(x, showcaseY + 40, mapPreviewKey)
                        .setDisplaySize(320, 180).setOrigin(0.5).setDepth(10);
                }
                this.add.text(x, showcaseY + 180, unlock.label || unlock.key, {
                    fontFamily: 'Arial Black', fontSize: 36, color: '#fff', stroke: '#000', strokeThickness: 6
                }).setOrigin(0.5);
            });
        }

        // Fun animated confetti
        for (let i = 0; i < 24; i++) {
            const confetti = this.add.rectangle(
                Phaser.Math.Between(100, 1350),
                Phaser.Math.Between(0, 950),
                Phaser.Math.Between(8, 18),
                Phaser.Math.Between(18, 32),
                Phaser.Display.Color.RandomRGB().color,
                Phaser.Math.FloatBetween(0.5, 0.9)
            );
            this.tweens.add({
                targets: confetti,
                angle: 360,
                y: 950 + Phaser.Math.Between(0, 200),
                duration: Phaser.Math.Between(1800, 3500),
                repeat: -1,
                delay: Phaser.Math.Between(0, 1200),
                ease: 'Sine.easeInOut',
                yoyo: false
            });
        }

        // Return to menu button
        const btn = this.add.text(725, 870, 'RETURN TO MENU', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ff4466', stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        // Also allow space/click to return
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainMenu');
        });
        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
