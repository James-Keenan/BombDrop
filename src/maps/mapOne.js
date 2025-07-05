const mapOne = {
    backgroundKey: 'sky',
    platforms: [
        { x: 900, y: 915, key: "ground", scaleX: 5.2, scaleY: 3 },
        { x: 1110, y: 185, key: "ground", scaleX: 1.2, scaleY: 0.3 },
        { x: -50, y: 150, key: "ground", scaleX: 1, scaleY: 0.3 },
        { x: 800, y: 600, key: "ground", scaleX: .8, scaleY: 0.3 },
        { x: 181, y: 825, key: "ground", scaleX: 1, scaleY: 5.3 }
        // Add more platforms as needed
    ],
    movingPlatforms: [
        {
            x: 408,
            y: 399,
            key: "ground",
            scaleX: 0.4,
            scaleY: 0.3,
            velocityX: 80,
            moveDirection: 1,
            minX: 300,
            maxX: 700
        }
        // Add more moving platforms as needed
    ],
    playerStart: { x: 100, y: 523 }
    // You can add stars, bombs, etc. here if you want, or keep this file focused on layout only
}

export default mapOne;
