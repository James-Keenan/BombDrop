// catsbyCorner.js
// Map definition for Catsby Corner

export const catsbyCorner = {
    key: 'catsbyCorner',
    label: "Catsby's Corner",
    previewKey: 'catBackground', // This should match the loaded asset key for the preview image
    backgroundKey: 'catBackground', // This should match the loaded asset key for the map background
    isRandom: false,
    data: {
        // Platforms using asset3.png and catAsset.png
        platforms: [
            // Cat floor (catfloor.png) at the very bottom
            {
                x: 725,
                y: 885,
                width: 1600,
                height: 140,
                asset: 'catfloor',
                scaleX: 1,
                scaleY: 2,
                bodyHeight: 80,      // height of visible part
                bodyOffsetY: 55      // transparent pixels at the top
            },
    
            // Right platform (catAsset.png)
            { x: 1150, y: 640, width: 260, height: 40, asset: 'asset3', scaleX: 1, scaleY: 1 },
            // Center platform (asset3.png)
            { x: 725, y: 400, width: 250, height: 40, asset: 'asset3', scaleX: 1, scaleY: 1 },
            // Left platform (catAsset.png)
            { x: 280, y: 720, width: 320, height: 40, asset: 'asset3', scaleX: 1, scaleY: 1 },
        ],
        // You can add more map-specific data here (star positions, hazards, etc.)
    }
};
