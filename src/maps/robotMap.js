
const robotMap = {
    backgroundKey: 'robotmap', // Use robotmap.png as background
    platforms: [
        // Floor at the bottom using 'ground'
        { x: 725, y: 900, key: "robotground", scaleX: 1.2, scaleY: .4 },
        // Floating platforms using 'plateform'
        { x: 345, y: 580, key: "plateform", scaleX: .1, scaleY: 0.3 }, //smallest plateform
        { x: 1260, y: 600, key: "plateform", scaleX: .15, scaleY: 0.3 },//under the wheel
        { x: 725, y: 830, key: "plateform", scaleX: .1, scaleY: 0.3 },//on floor
        { x: 725, y: 810, key: "plateform", scaleX: .1, scaleY: 0.3 },//on floor
        { x: 725, y: 790, key: "plateform", scaleX: .1, scaleY: 0.3 },//on floor
        { x: 910, y: 480, key: "plateform", scaleX: .33, scaleY: 0.3 },//under tv
        { x: 155, y: 320, key: "plateform", scaleX: .16, scaleY: 0.3 }//top left under bolt
    ],
    movingPlatforms: [
        // Add moving platforms here if needed, same structure as mapOne.js
    ],
    playerStart: { x: 725, y: 750 }
};

export default robotMap;
