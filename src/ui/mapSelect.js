// mapSelect.js
// UI overlay for map selection in BombDrop
// Exports a function to show the map select UI and handle selection


export function showMapSelect(scene, maps, onSelect) {
    // Map unlock status (flags in localStorage)
    const catsbyCornerUnlocked = localStorage.getItem('catsbyCornerUnlocked') === 'true';
    const robotMapUnlocked = localStorage.getItem('robotMapUnlocked') === 'true';
    // Overlay background (bigger for more maps)
    const overlay = scene.add.rectangle(725, 475, 1350, 800, 0x001122, 0.97).setDepth(100);

    // --- Add CHOOSE PLAYER and CHOOSE MAP buttons above the player and arena UI ---
    // Place at the top of the overlay box
    // No label at the top for choose map UI

    // Arrange maps in two rows
    const mapSprites = [];
    const mapGlows = [];
    const mapLabels = [];
    let selectedIdx = 0;
    const n = maps.length;
    const mapWidth = 220;
    const mapHeight = 140;
    const boxWidth = 1350;
    const mapsPerRow = Math.ceil(n / 2);
    const rowGap = 200; // Much more vertical gap between rows
    const colGap = (boxWidth - mapsPerRow * mapWidth) / (mapsPerRow + 1) + 30; // Increased horizontal gap between maps
    const startY = 300; // Move maps even higher
    maps.forEach((map, i) => {
        const row = Math.floor(i / mapsPerRow);
        const col = i % mapsPerRow;
        // Center each row independently
        const mapsInThisRow = (row === 0 && n > mapsPerRow) ? mapsPerRow : n - mapsPerRow;
        const rowBoxWidth = mapsInThisRow * mapWidth + (mapsInThisRow + 1) * colGap - colGap;
        const rowStartX = 625 - rowBoxWidth / 2; // Move maps more to the left
        const x = rowStartX + colGap * (col + 1) + mapWidth / 2 + col * mapWidth;
        const y = startY + row * (mapHeight + rowGap);
        // Glow highlight (behind image)
        const glow = scene.add.circle(x, y, 80, 0x00ffd0, 0.13).setDepth(100);
        mapGlows.push(glow);
        // Determine unlock status for this map (automatic, no star spending)
        let locked = false;
        let unlockMsg = '';
        if (map.key === 'catsbyCorner') {
            locked = !catsbyCornerUnlocked;
            unlockMsg = "Reach level 2 on Turnup's Trail to unlock Catsby's Corner.";
        } else if (map.key === 'robotMap') {
            locked = !robotMapUnlocked;
            unlockMsg = "Complete any level of Catsby's Corner to unlock Tekno's Robot Map.";
        } else if (map.key === 'gabbiesGrave') {
            const robotMapHighLevel = parseInt(localStorage.getItem('robotMap_highLevel') || '0', 10);
            locked = !robotMapUnlocked; // Or use a progress flag if available
            unlockMsg = "Complete any level of Tekno's Robot Map to unlock Gabbie's Grave.";
        } else if (map.key === 'peteStreet') {
            const gabbiesGraveUnlocked = localStorage.getItem('gabbiesGraveUnlocked') === 'true';
            locked = !gabbiesGraveUnlocked;
            unlockMsg = "Complete any level of Gabbie's Grave to unlock Pete's Street.";
        } else if (map.key === 'mapOne') {
            locked = false; // Always unlocked
        }
        // Map preview image (use map.previewKey)
        const sprite = scene.add.image(x, y, map.previewKey)
            .setDisplaySize(220, 140)
            .setOrigin(0.5)
            .setDepth(101)
            .setInteractive({ useHandCursor: true });
        // Add lock icon if locked, with fallback if asset missing
        // Track lock visuals for cleanup
        let lockIconObj = null;
        let fallbackCircle = null;
        let fallbackText = null;
        if (locked) {
            // Show lock icon
            if (scene.textures && scene.textures.exists && scene.textures.exists('lock')) {
                lockIconObj = scene.add.image(x, y, 'lock')
                    .setDisplaySize(110, 110)
                    .setAlpha(0.18)
                    .setDepth(200);
            } else {
                fallbackCircle = scene.add.circle(x, y, 60, 0x222222, 0.92).setDepth(200);
                fallbackText = scene.add.text(x, y, '🔒', {
                    fontFamily: 'Arial Black', fontSize: 60, color: '#ffff66', stroke: '#000', strokeThickness: 7
                }).setOrigin(0.5).setDepth(201);
            }
            // Show unlock message inside the map image (lowered into the image)
            const unlockText = scene.add.text(x, y + 10, unlockMsg, {
                fontFamily: 'Arial Black', fontSize: 20, color: '#ff4466', stroke: '#000', strokeThickness: 5, align: 'center', wordWrap: { width: 210 }
            }).setOrigin(0.5).setDepth(202);
            mapLabels.push(unlockText);
        }
        // Store lock visuals for cleanup
        if (lockIconObj) mapLabels.push(lockIconObj);
        if (fallbackCircle) mapLabels.push(fallbackCircle);
        if (fallbackText) mapLabels.push(fallbackText);
        mapSprites.push(sprite);
        // Map label
        const label = scene.add.text(x, y + 100, map.label, {
            fontFamily: 'Arial Black', fontSize: 28, color: '#00ffd0', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(101);
        mapLabels.push(label);
        // Add highest level and highest score (skip random)
        if (!map.isRandom) {
            // Use localStorage keys: `${map.key}_highLevel` and `${map.key}_highScore`
            const highLevel = localStorage.getItem(`${map.key}_highLevel`) || '0';
            const highScore = localStorage.getItem(`${map.key}_highScore`) || '0';
            // Debug log for per-map stat display
            console.log(`[DISPLAY] Map ${map.key}: highLevel =`, highLevel, ', highScore =', highScore);
            // Move stats text further down, and make it smaller
            const statsText = scene.add.text(x, y + 155, `Highest Level: ${highLevel}\nHighest Score: ${highScore}`,
                { fontFamily: 'Arial Black', fontSize: 22, color: '#fff', stroke: '#000', strokeThickness: 5, align: 'center' })
                .setOrigin(0.5).setDepth(101);
            mapLabels.push(statsText);
        }
        // Draw 5 stars above the map (except random)
        if (!map.isRandom) {
            // --- NEW STAR FILL LOGIC ---
            // Each level = 1/7 of a star, up to 5 stars (35 levels)
            const highLevel = parseInt(localStorage.getItem(`${map.key}_highLevel`) || '0', 10);
            const totalStars = Math.min(5, highLevel / 7);
            const starY = y - 100;
            const starSpacing = 36;
            for (let s = 0; s < 5; s++) {
                const starX = x + (s - 2) * starSpacing;
                // Make background star much dimmer and more transparent
                const bgStar = scene.add.image(starX, starY, 'star')
                    .setDisplaySize(32, 32)
                    .setOrigin(0.5)
                    .setDepth(101)
                    .setTint(0x555555)
                    .setAlpha(0.45);
                mapLabels.push(bgStar);
                // Calculate fill for this star
                let fill = 0;
                if (highLevel > s * 7) {
                    // This star is at least partially filled
                    fill = Math.min(1, (highLevel - s * 7) / 7);
                }
                if (fill > 0) {
                    // Draw a dark outline behind the gold star
                    const outlineStar = scene.add.image(starX, starY, 'star')
                        .setDisplaySize(36, 36)
                        .setOrigin(0.5)
                        .setDepth(199)
                        .setTint(0x111111)
                        .setAlpha(0.85);
                    mapLabels.push(outlineStar);
                    // Make gold star extra bright and saturated
                    const goldStar = scene.add.image(starX, starY, 'star')
                        .setDisplaySize(32, 32)
                        .setOrigin(0.5)
                        .setDepth(200)
                        .setTint(0xFFF700)
                        .setAlpha(1);
                    // Crop the gold star to show the fill (at least 1px if >0)
                    const cropWidth = Math.max(1, Math.round(32 * fill));
                    goldStar.setCrop(0, 0, cropWidth, 32);
                    mapLabels.push(goldStar);
                }
            }
        }
        sprite.on('pointerdown', () => {
            if (!locked) {
                highlightMap(i);
                cleanup();
                if (onSelect) onSelect(i);
            } else {
                // Show only an informational message for locked maps (no unlock button)
                const msgBg = scene.add.rectangle(725, 475, 600, 120, 0x222244, 0.98).setDepth(300).setStrokeStyle(4, 0x00ffd0);
                const msgText = scene.add.text(725, 475, unlockMsg, {
                    fontFamily: 'Arial Black', fontSize: 28, color: '#00ffd0', stroke: '#000', strokeThickness: 5, align: 'center', wordWrap: { width: 540 }
                }).setOrigin(0.5).setDepth(301);
                const dismiss = () => { msgBg.destroy(); msgText.destroy(); };
                msgBg.setInteractive().on('pointerdown', dismiss);
                msgText.setInteractive().on('pointerdown', dismiss);
                scene.time.delayedCall(2500, dismiss);
            }
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
    // Place close button at the true top-right of the overlay box
    const overlayWidth = 1350;
    const overlayHeight = 800;
    const closeBtnX = 725 + overlayWidth / 2 - 50;
    const closeBtnY = 475 - overlayHeight / 2 + 50;
    const closeBtn = scene.add.text(closeBtnX, closeBtnY, '✕', {
        fontFamily: 'Arial Black', fontSize: 48, color: '#ff4466', stroke: '#000', strokeThickness: 8
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', cleanup);

    function cleanup() {
        overlay.destroy();
        mapGlows.forEach(g => g.destroy());
        mapSprites.forEach(s => s.destroy());
        mapLabels.forEach(l => { if (l && l.destroy) l.destroy(); });
        closeBtn.destroy();
        // Removed chooseMapLabel.destroy(); as chooseMapLabel is not defined
    }
}
