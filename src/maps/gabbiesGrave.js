// gabbiesGrave.js
// Map definition for Gabbie's Grave

export const gabbiesGrave = {
    key: 'gabbiesGrave',
    label: "Gabbie's Grave",
    previewKey: 'gabbies_grave_preview',
    previewFrame: 0,
    // Define map layout, platforms, and any special features here
    platforms: [
        // Example platform layout (x, y, width, height, yOffset)
        { x: 720, y: 900, width: 1550, height: 120, texture: 'zara ground', yOffset: 300, bodyOffsetY: 25 }, // Ground
        { x: 200, y: 475, width: 100, height: 100, texture: 'grass', yOffset: 0, bodyOffsetY: 23 },
        { x: 400, y: 680, width: 100, height: 40, texture: 'grass', yOffset: 0, bodyOffsetY: 2 },
        { x: 975, y: 600, width: 200, height: 100, texture: 'grass', yOffset: 0, bodyOffsetY: 23 },
        { x: 675, y: 475, width: 180, height: 80, texture: 'grass', yOffset: 0, bodyOffsetY: 23 },
        { x: 1335, y: 460, width: 150, height: 80, texture: 'grass', yOffset: 0, bodyOffsetY: 23 },
        // Add more platforms as needed
    ],
    // Add any special map logic or hazards here
    hazards: [
        // Example: { type: 'spike', x: 725, y: 880, width: 200 }
    ],
    backgroundKey: 'zara background',
    musicKey: 'gabbies_grave_theme', // Optional: add a unique music track
    // Any other custom properties for this map
};
