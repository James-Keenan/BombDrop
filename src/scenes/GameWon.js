import { getClosestAchievements } from '../ui/achievements.js';
// GameWon.js
// Scene for when the player wins the game (reaches level 40)

export class GameWon extends Phaser.Scene {
    constructor() {
        super('GameWon');
    }

    create() {
        // Hide mobile controller if present
        if (window.hideMobileController) window.hideMobileController();

        // Set background
        this.cameras.main.setBackgroundColor(0x1a1a2c);
        let bg = this.add.image(725, 475, 'sky').setAlpha(0.5);
        bg.setScale(1450 / bg.width, 950 / bg.height);

        // Get info from registry/localStorage
        const user = localStorage.getItem('username') || 'Player';
        // Show win screen after level 3 for testing
        const finalLevel = this.registry.get('finalLevel') || 3;
        const finalScore = this.registry.get('finalScore') || 0;
        const selectedMapKey = this.registry.get('selectedMapKey') || 'mapOne';
        const mapName = this.registry.get('selectedMapName') || this.getMapName(selectedMapKey);
        const unlockedChar = this.registry.get('unlockedCharacter');
        let unlockedMap = this.registry.get('unlockedMap');
        const achievements = this.getEarnedAchievements();

        // --- Unlock Catsby's Corner if player reached level 2+ on Turnup's Trail ---
        if (selectedMapKey === 'mapOne' && finalLevel >= 2) {
            // Check if not already unlocked
            const catsbyKey = 'catsbyCorner_unlocked';
            if (!localStorage.getItem(catsbyKey) || localStorage.getItem(catsbyKey) !== 'true') {
                localStorage.setItem(catsbyKey, 'true');
                // Optionally, set in registry for UI
                unlockedMap = {
                    key: 'catsbyCorner',
                    label: "Catsby's Corner",
                    previewKey: 'cat' // or whatever preview sprite you use
                };
                this.registry.set('unlockedMap', unlockedMap);
            }
        }

        // Main congratulatory message
        this.add.text(725, 120, `Congratulations ${user}!`, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffe066', stroke: '#000', strokeThickness: 10, align: 'center'
        }).setOrigin(0.5);
        this.add.text(725, 210, `You have beat ${mapName}!`, {
            fontFamily: 'Arial Black', fontSize: 48, color: '#66ff99', stroke: '#000', strokeThickness: 8, align: 'center'
        }).setOrigin(0.5);

        // Final stats
        this.add.text(725, 270, `Final Level: ${finalLevel}    Final Score: ${finalScore}`, {
            fontFamily: 'Arial', fontSize: 32, color: '#fff', stroke: '#000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);

        // Achievements earned
        this.add.text(725, 340, 'Achievements Earned:', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffe066', stroke: '#000', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5);
        if (achievements.length > 0) {
            achievements.forEach((ach, i) => {
                this.add.text(725, 390 + i * 36, `• ${ach.name}${ach.tier ? ' ' + ach.tier : ''}`, {
                    fontFamily: 'Arial', fontSize: 28, color: '#fff', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
            });
        } else {
            // Show 3 closest achievements if none earned
            const closest = getClosestAchievements();
            if (closest.length > 0) {
                this.add.text(725, 390, 'Closest Achievements:', {
                    fontFamily: 'Arial', fontSize: 28, color: '#fff', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
                closest.forEach((ach, i) => {
                    const progress = window.getProgress(ach);
                    this.add.text(725, 430 + i * 36, `• ${ach.name} (${progress}/${ach.goal})`, {
                        fontFamily: 'Arial', fontSize: 24, color: '#cccccc', stroke: '#000', strokeThickness: 2
                    }).setOrigin(0.5);
                });
            } else {
                this.add.text(725, 390, 'No achievements earned this run.', {
                    fontFamily: 'Arial', fontSize: 28, color: '#fff', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
            }
        }

        // Showcase unlocked character or map
        // Show all unlocked characters and maps in a single horizontal row (multi-unlock support)
        let showcaseY = 600;
        const unlockedCharacters = this.registry.get('unlockedCharacters') || [];
        const unlockedMaps = this.registry.get('unlockedMaps') || [];
        // Merge all unlocks into a single array, preserving type for badge
        const allUnlocks = [
            ...unlockedCharacters.map(char => ({
                ...char,
                label: char.key === 'cat' ? 'CATsby' : char.label,
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

        // Return to menu button
        const btn = this.add.text(725, 870, 'RETURN TO MENU', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ff4466', stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    // Helper: get map name from key
    getMapName(key) {
        const mapNames = {
            mapOne: "Turnup's Trail",
            catsbyCorner: "Catsby's Corner",
            robotMap: "Tekno's Terminal",
            gabbiesGrave: "Gabbie's Grave"
        };
        return mapNames[key] || key;
    }

    // Helper: get all achievements earned this run
    getEarnedAchievements() {
        // This should be replaced with your actual achievement tracking logic
        // For now, try to read from window.earnedAchievements or localStorage
        if (window.earnedAchievements && Array.isArray(window.earnedAchievements)) {
            return window.earnedAchievements;
        }
        // Example fallback: parse from localStorage (if you store them as JSON)
        try {
            const data = localStorage.getItem('earnedAchievements');
            if (data) return JSON.parse(data);
        } catch (e) {}
        return [];
    }
}
