// playerQuotes.js
// Provides quotes for each player and a function to show a thought bubble in the UI

// Example structure for player quotes (fill in with real quotes as needed)
export const PLAYER_QUOTES = {
    dude: [
        "lets Turnup!",
        "Ready for action!",
        "Bring it on!"
    ],
    cat: [
        "I'm the great Catsby!",
        "I hope i have nine lives!",
        "Purr-fect score!"
    ],
    robot: [
        "Beep boop, victory mode!",
        "Ctrl, Alt, Elite!",
        "System: Dominate!"
    ],
    // Add more players and their quotes here
};

// Utility to get a random quote for a player
export function getRandomQuote(playerKey) {
    const quotes = PLAYER_QUOTES[playerKey] || [];
    if (quotes.length === 0) return '';
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Shows a thought bubble at (x, y) with the given text, returns the bubble group
export function showThoughtBubble(scene, x, y, text) {
    // Bubble background
    const bubble = scene.add.graphics();
    bubble.fillStyle(0xffffff, 1);
    bubble.fillRoundedRect(x, y, 220, 70, 24);
    bubble.lineStyle(4, 0x222222, 1);
    bubble.strokeRoundedRect(x, y, 220, 70, 24);
    // Bubble tail (triangle) - bottom left, pointing diagonally to player
    const tailBaseX1 = x + 30;
    const tailBaseY1 = y + 70;
    const tailBaseX2 = x + 60;
    const tailBaseY2 = y + 90;
    const tailTipX = x + 10;
    const tailTipY = y + 110;
    bubble.fillTriangle(tailBaseX1, tailBaseY1, tailBaseX2, tailBaseY2, tailTipX, tailTipY);
    bubble.lineStyle(4, 0x222222, 1);
    bubble.strokeTriangle(tailBaseX1, tailBaseY1, tailBaseX2, tailBaseY2, tailTipX, tailTipY);
    // Quote text (original position)
    const quoteText = scene.add.text(x+110, y+35, text, {
        fontFamily: 'Arial Black', fontSize: 22, color: '#111', align: 'center', wordWrap: { width: 200 }
    }).setOrigin(0.5);
    // Group for easy cleanup
    const group = scene.add.container(-30, 0, [bubble, quoteText]);
    // Fade out after 5 seconds
    scene.time.delayedCall(5000, () => {
        scene.tweens.add({
            targets: group,
            alpha: 0,
            duration: 800,
            onComplete: () => group.destroy()
        });
    });
    return group;
}
