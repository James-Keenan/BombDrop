// mapSelect.js
// UI overlay for map selection in BombDrop
// Exports a function to show the map select UI and handle selection

export function showMapSelect(scene, maps, onSelect) {
    // Overlay background (much bigger)
    const overlay = scene.add.rectangle(725, 475, 1100, 600, 0x001122, 0.97).setDepth(100);

    // Spread out all map images evenly in the box
    const mapY = 475;
    const boxWidth = 1100;
    const margin = 120;
    const usableWidth = boxWidth - 2 * margin;
    const mapSprites = [];
    const mapGlows = [];
    const mapLabels = [];
    let selectedIdx = 0;
    const n = maps.length;

    // Center maps perfectly: use padding at both ends
    const mapWidth = 220; // width of each map image
    const minGap = 60; // minimum gap between maps and from edge
    let gap = minGap;
    if (n > 1) {
        // Calculate max gap that fits all maps inside usableWidth
        gap = Math.max(minGap, (usableWidth - n * mapWidth) / (n - 1));
    }
    const totalWidth = n * mapWidth + (n - 1) * gap;
    const startX = 725 - totalWidth / 2 + mapWidth / 2;
    maps.forEach((map, i) => {
        let x = startX + i * (mapWidth + gap);
        // Glow highlight (behind image)
        const glow = scene.add.circle(x, mapY, 80, 0x00ffd0, 0.13).setDepth(100);
        mapGlows.push(glow);
        // Map preview image (use map.previewKey)
        const sprite = scene.add.image(x, mapY, map.previewKey)
            .setDisplaySize(220, 140)
            .setOrigin(0.5)
            .setDepth(101)
            .setInteractive({ useHandCursor: true });
        mapSprites.push(sprite);
        // Map label
        const label = scene.add.text(x, mapY + 100, map.label, {
            fontFamily: 'Arial Black', fontSize: 28, color: '#00ffd0', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(101);
        mapLabels.push(label);
        sprite.on('pointerdown', () => {
            highlightMap(i);
            cleanup();
            if (onSelect) onSelect(i);
        });
    });

    // Highlight selected map
    function highlightMap(idx) {
        selectedIdx = idx;
        // No highlight effect
        // Live update main menu showcase
        if (onSelect) onSelect(idx);
    }
    highlightMap(selectedIdx);

    // (Removed Choose Map button: selection is now instant on click)

    // Close button
    // Place close button at top-right of the overlay box
    const closeBtn = scene.add.text(725 + 1100/2 - 40, 200, '✕', {
        fontFamily: 'Arial Black', fontSize: 48, color: '#ff4466', stroke: '#000', strokeThickness: 8
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', cleanup);

    function cleanup() {
        overlay.destroy();
        mapGlows.forEach(g => g.destroy());
        mapSprites.forEach(s => s.destroy());
        mapLabels.forEach(l => l.destroy());
        closeBtn.destroy();
    }
}
