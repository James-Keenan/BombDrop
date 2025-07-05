// playerSelect.js
// UI overlay for player (character) selection in BombDrop
// Exports a function to show the player select UI and handle selection

export function showPlayerSelect(scene, characters, onSelect) {
    // Overlay background (much bigger)
    const overlay = scene.add.rectangle(725, 475, 1100, 600, 0x000022, 0.95).setDepth(100);

    // Spread out all character sprites evenly in the box
    const spriteY = 475;
    const boxWidth = 1100;
    const margin = 120;
    const usableWidth = boxWidth - 2 * margin;
    const charSprites = [];
    const charGlows = [];
    const n = characters.length;
    const charLabels = [];
    let selectedIdx = 0;
    // For robot text bubble
    let robotBubble = null;
    let robotBubbleTimeout = null;

    characters.forEach((char, i) => {
        // Evenly distribute: for n=1, center; for n>1, spread edge-to-edge
        let x;
        if (n === 1) {
            x = 725;
        } else {
            x = 725 - usableWidth / 2 + (usableWidth) * (i / (n - 1));
        }
        // Smaller, consistent glow highlight (behind sprite)
        const glow = scene.add.circle(x, spriteY, 55, 0xffff66, 0.18).setDepth(100);
        // Extra effect for press (hidden by default)
        const pressEffect = scene.add.circle(x, spriteY, 70, 0xffffff, 0).setDepth(99);
        charGlows.push(glow);
        const sprite = scene.add.sprite(x, spriteY, char.previewKey, char.previewFrame)
            .setScale(char.scale * 1.7)
            .setOrigin(0.5)
            .setDepth(101)
            .setInteractive({ useHandCursor: true });
        const label = scene.add.text(x, spriteY + 120, char.label, {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffff66', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(101);
        charSprites.push(sprite);
        charLabels.push(label);
        sprite.on('pointerdown', () => {
            // Animate effect behind player
            pressEffect.setAlpha(0.5);
            pressEffect.setScale(1);
            scene.tweens.add({
                targets: pressEffect,
                alpha: 0,
                scale: 2.2,
                duration: 350,
                ease: 'Cubic.easeOut',
            });
            highlightChar(i);
            // Instantly pick and close overlay
            cleanup();
            if (typeof onSelect === 'function') onSelect(i);
        });
    });

    // Highlight selected character
    function highlightChar(idx) {
        selectedIdx = idx;
        // No highlight effect
    }
    highlightChar(selectedIdx);

    // (Removed Choose Character button: selection is now instant on click)

    // Close button
    // Place close button at top-right of the overlay box
    const closeBtn = scene.add.text(725 + 1100/2 - 40, 200, '✕', {
        fontFamily: 'Arial Black', fontSize: 48, color: '#ff4466', stroke: '#000', strokeThickness: 8
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', cleanup);

    function cleanup() {
        overlay.destroy();
        charGlows.forEach(g => g.destroy());
        // Destroy press effects if present
        scene.children.list.filter(obj => obj && obj.type === 'Arc' && obj.depth === 99).forEach(obj => obj.destroy());
        charSprites.forEach(s => s.destroy());
        charLabels.forEach(l => l.destroy());
        closeBtn.destroy();
        // Remove robot bubble if present
        if (robotBubble) { 
            if (robotBubble.bubbleText) robotBubble.bubbleText.destroy();
            robotBubble.destroy(); 
            robotBubble = null;
        }
        if (robotBubbleTimeout) clearTimeout(robotBubbleTimeout);
    }
}
