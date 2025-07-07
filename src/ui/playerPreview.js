// playerPreview.js
// Adds a player preview sprite to the map select UI and handles player selection

export function addPlayerPreview(scene, x, y, player, onSelect) {
    // Remove any previous preview if needed (not handled here)
    const sprite = scene.add.sprite(x, y, player.previewKey, player.previewFrame)
        .setScale(player.scale * 1.7)
        .setOrigin(0.5)
        .setDepth(101)
        .setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', () => {
        if (onSelect) onSelect();
    });
    return sprite;
}
