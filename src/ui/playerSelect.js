// playerSelect.js
// UI overlay for player (character) selection in BombDrop
// Exports a function to show the player select UI and handle selection

export function showPlayerSelect(scene, characters, onSelect) {
    // Overlay background (much bigger)
    // Add a full-screen invisible blocker to prevent interaction with main menu
    // Make the UI overlay larger and increase vertical space between rows
    const blocker = scene.add.rectangle(725, 475, 1450, 950, 0x000000, 0.001).setDepth(99).setInteractive();
    const overlay = scene.add.rectangle(725, 475, 1300, 800, 0x000022, 0.95).setDepth(100);

    // Arrange characters in two rows
    const n = characters.length;
    const charsPerRow = Math.ceil(n / 2);
    const rowGap = 340; // Much more vertical gap between rows
    const spriteY1 = 320; // Move first row up a bit
    const spriteY2 = spriteY1 + rowGap;
    const boxWidth = 1200; // Wider for more space
    const margin = 170; // More margin for wider overlay
    const usableWidth = boxWidth - 2 * margin;
    const charSprites = [];
    const charGlows = [];
    const charLabels = [];
    let selectedIdx = 0;
    // For robot text bubble
    let robotBubble = null;
    let robotBubbleTimeout = null;

    // Determine unlock status (now uses explicit unlock flags)
    const catsbyUnlocked = localStorage.getItem('catsbyUnlocked') === 'true';
    const teknoUnlocked = localStorage.getItem('robotUnlocked') === 'true';

    // Track all lock/chain/fallback objects for cleanup
    const lockObjects = [];
    characters.forEach((char, i) => {
        // Two-row layout
        const row = Math.floor(i / charsPerRow);
        const col = i % charsPerRow;
        const y = row === 0 ? spriteY1 : spriteY2;
        // Center each row independently
    const charsInThisRow = (row === 0 && n > charsPerRow) ? charsPerRow : n - charsPerRow;
    const playerWidth = 170; // Increased width per player
    const playerGap = 110;   // Increased gap between players
    const rowBoxWidth = charsInThisRow * playerWidth + (charsInThisRow - 1) * playerGap;
    const rowStartX = 725 - rowBoxWidth / 2;
    const x = rowStartX + col * (playerWidth + playerGap);
        const glow = scene.add.circle(x, y, 55, 0xffff66, 0.18).setDepth(100);
        const pressEffect = scene.add.circle(x, y, 70, 0xffffff, 0).setDepth(99);
        charGlows.push(glow);
        let sprite;
        let locked = false;
        if (char.key === 'cat') {
            locked = !catsbyUnlocked;
        } else if (char.key === 'robot') {
            locked = !teknoUnlocked;
        } else if (char.key === 'zarazombie') {
            // Lock Gabbie until Pluto reaches level 20 on Gabbie's Grave
            const plutoGabbieLevel = parseInt(localStorage.getItem('pluto_gabbiesGrave_highLevel') || '0', 10);
            locked = plutoGabbieLevel < 20;
        } else if (char.key === 'pluto') {
            // Lock Pluto until Gabbie's Grave is played at least once
            const gabbiesGravePlayed = parseInt(localStorage.getItem('gabbiesGravePlayed') || '0', 10);
            locked = gabbiesGravePlayed < 1;
        } else if (char.key !== 'dude' && !char.isRandom) {
            locked = true;
        }
        if (char.isRandom && char.previewKey === 'question_mark') {
            sprite = scene.add.image(x, y, char.previewKey)
                .setDisplaySize(110, 110)
                .setOrigin(0.5)
                .setDepth(101)
                .setInteractive({ useHandCursor: true });
        } else if (char.key === 'pluto') {
            // Pluto: use sprite sheet for preview, not image
            let spriteX = x;
            let scale = 0.25 * 1.7;
            sprite = scene.add.sprite(spriteX, y, 'pluto', 0)
                .setScale(scale)
                .setOrigin(0.5)
                .setDepth(101)
                .setInteractive({ useHandCursor: true });
        } else if (char.key === 'pete') {
            // Lock Pete until Catsby reaches level 10 on Pete's Street
            const catsbyPeteLevel = parseInt(localStorage.getItem('cat_peteStreet_highLevel') || '0', 10);
            locked = catsbyPeteLevel < 10;
            // Pete: use sprite sheet for preview, not image
            let spriteX = x;
            let scale = 0.12 * 1.7;
            sprite = scene.add.sprite(spriteX, y, 'pete', 0)
                .setScale(scale)
                .setOrigin(0.5)
                .setDepth(101)
                .setInteractive({ useHandCursor: true });
        } else {
            // For Gabbie, offset the sprite only (not the label) to visually center with her name
            let spriteX = x;
            if (char.key === 'zarazombie') {
                spriteX = x + 22; // Adjust this value as needed for perfect centering
            }
            // Use same scale as other large characters
            let scale = char.scale * 1.7;
            if (char.key === 'cat' || char.key === 'robot' || char.key === 'zarazombie') {
                scale = 0.25 * 1.7;
            }
            sprite = scene.add.sprite(spriteX, y, char.previewKey, char.previewFrame)
                .setScale(scale)
                .setOrigin(0.5)
                .setDepth(101);
            sprite.setInteractive({ useHandCursor: true });
        }
        // Add chain and lock icon if locked
        let lockIcon = null;
        if (locked) {
            // Show unlock message above the lock for all locked characters
            let unlockMsg = '';
            if (char.key === 'pluto') {
                unlockMsg = "Complete any level of Gabbie's Grave to unlock Pluto.";
            } else if (char.key === 'zarazombie') {
                unlockMsg = "Complete any level of Pete's Street to unlock Gabbie.";
            } else if (char.key === 'cat') {
                unlockMsg = "Complete any level of Catsby's Corner to unlock Cat.";
            } else if (char.key === 'robot') {
                unlockMsg = "Complete any level of Tekno's Robot Map to unlock Tekno.";
            } else if (char.key === 'pete') {
                unlockMsg = "Win on every map to unlock Pete!";
            } else if (char.key === 'dude') {
                unlockMsg = "Always unlocked.";
            } else if (char.isRandom) {
                unlockMsg = "Random character.";
            } else {
                unlockMsg = "Locked.";
            }
            // Only show unlock message if locked
            if (locked && unlockMsg) {
                const unlockText = scene.add.text(x, y - 50, unlockMsg, {
                    fontFamily: 'Arial Black', fontSize: 18, color: '#ff4466', stroke: '#000', strokeThickness: 4, align: 'center', wordWrap: { width: 220 }
                }).setOrigin(0.5).setDepth(201);
                lockObjects.push(unlockText);
            }
            // Draw a chain (simple gray rectangle) and lock icon
            // Adjusted: lock and chain are visually prominent and lock is a bit higher for better alignment
            const chainY = y + 40;
            const lockY = y + 55; // was +65, now +55 for 10px higher
            const chain = scene.add.rectangle(x, chainY, 80, 16, 0x888888, 0.8).setDepth(200);
            lockObjects.push(chain);
            // Try to add lock icon, fallback to emoji if asset missing
            let lockImageLoaded = false;
            let lockIconObj = null;
            let fallbackCircle = null;
            let fallbackText = null;
            try {
                if (scene.textures.exists('lock')) {
                    lockIconObj = scene.add.image(x, lockY, 'lock')
                        .setDisplaySize(80, 80)
                        .setAlpha(0.12) // Make the lock picture very transparent
                        .setDepth(201);
                    lockObjects.push(lockIconObj);
                    lockImageLoaded = true;
                }
            } catch (e) {}
            if (!lockImageLoaded) {
                fallbackCircle = scene.add.circle(x, lockY, 44, 0x222222, 0.95).setDepth(201);
                fallbackText = scene.add.text(x, lockY, '🔒', {
                    fontFamily: 'Arial Black', fontSize: 54, color: '#ffff66', stroke: '#000', strokeThickness: 6
                }).setOrigin(0.5).setDepth(202);
                lockObjects.push(fallbackCircle, fallbackText);
            }
        }
        // Always center the label at x, not spriteX, so the name is centered in the slot
        const label = scene.add.text(x, y + 120, char.label, {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffff66', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(101);
        charSprites.push(sprite);
        charLabels.push(label);
        sprite.on('pointerdown', () => {
            if (!locked) {
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
                cleanup();
                if (typeof onSelect === 'function') onSelect(i);
            } else {
                // Show unlock explanation when lock is pressed
                let unlockMsg = '';
                if (char.key === 'pluto') {
                    unlockMsg = "Play Gabbie's Grave to unlock Pluto.";
                } else if (char.key === 'zarazombie') {
                    unlockMsg = "Get Pluto to level 20 on Gabbie's Grave to unlock Gabbie.";
                } else if (char.key === 'cat') {
                    unlockMsg = "Complete any level of Catsby's Corner to unlock Cat.";
                } else if (char.key === 'robot') {
                    unlockMsg = "Complete any level of Tekno's Robot Map to unlock Tekno.";
                } else if (char.key === 'pete') {
                    unlockMsg = "Get CATsby to level 10 on Pete's Street to unlock Pete.";
                } else if (char.key === 'dude') {
                    unlockMsg = "Always unlocked.";
                } else if (char.isRandom) {
                    unlockMsg = "Random character.";
                } else {
                    unlockMsg = "Locked.";
                }
                // Centered, larger popup for unlock explanation
                const msgBg = scene.add.rectangle(725, 475, 600, 120, 0x222244, 0.98).setDepth(300).setStrokeStyle(4, 0xff4466);
                const msgText = scene.add.text(725, 475, unlockMsg, {
                    fontFamily: 'Arial Black', fontSize: 28, color: '#ff4466', stroke: '#000', strokeThickness: 5, align: 'center', wordWrap: { width: 540 }
                }).setOrigin(0.5).setDepth(301);
                const dismiss = () => { msgBg.destroy(); msgText.destroy(); };
                msgBg.setInteractive().on('pointerdown', dismiss);
                msgText.setInteractive().on('pointerdown', dismiss);
                scene.time.delayedCall(2500, dismiss);
            }
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
        blocker.destroy();
        overlay.destroy();
        charGlows.forEach(g => g.destroy());
        // Destroy press effects if present
        scene.children.list.filter(obj => obj && obj.type === 'Arc' && obj.depth === 99).forEach(obj => obj.destroy());
        charSprites.forEach(s => s.destroy());
        // Destroy lock icons, chains, and fallback lock emoji objects
        lockObjects.forEach(obj => { if (obj && obj.destroy) obj.destroy(); });
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
