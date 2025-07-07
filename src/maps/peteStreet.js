// peteStreet.js
// Map definition for Pete the Possum's map: Pete Street

export const peteStreet = {
    key: 'peteStreet',
    label: "Pete's Street",
    backgroundKey: 'petesMap',
    platforms: [
        // Floor platform (bottom of map)
        { x: 725, y: 900, width: 1500, height: 125, imageKey: 'petefloor' },//floor
        // Other platforms
        { x: 200, y: 585, width: 425, height: 40, imageKey: 'pinkBlock' }, //
        { x: 1100, y: 535, width: 500, height: 40, imageKey: 'neonBlock' },// under possum
        { x: 720, y: 700, width: 240, height: 40, imageKey: 'blueBlock' },
        { x: 1100, y: 360, width: 500, height: 40, imageKey: 'pinkBlock' },
        { x: 460, y: 420, width: 265, height: 40, imageKey: 'neonBlock' }
    ],
    spawn: { x: 250, y: 700 },
    // floorKey removed: floor is now part of platforms array
    // Add more map-specific properties as needed
};
