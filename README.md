# BombDrop

A dynamic arcade-style game built with Phaser.js where players avoid bombs and collect stars across multiple levels.

## 🎮 Features

- **Multiple Characters**: Choose from Dude, Cat, or Robot
- **Progressive Difficulty**: Levels get harder with more bombs and stars
- **Unlockable Abilities**: Double jump, fast fall, barriers, and power-ups
- **Mobile Support**: Landscape-mode controller for mobile devices
- **Level Progression**: Advance through levels by collecting all stars
- **High Score System**: Track your personal best and highest level reached

## 🕹️ Controls

### Desktop
- **Arrow Keys**: Move left and right
- **UP Arrow**: Jump (double jump unlocks at level 2)
- **DOWN Arrow**: Fast fall while jumping (unlocks at level 3)
- **SPACE**: Activate magnetic barrier (unlocks at level 5)

### Mobile (Landscape Mode Required)
- **Left Side**: Move left, fast fall, EMP
- **Right Side**: Move right, jump, barrier, sonic boom
- Touch and hold buttons for continuous actions

## 🚀 How to Play

1. **Objective**: Collect all stars in each level while avoiding bombs
2. **Movement**: Use arrow keys or mobile controls to move and jump
3. **Progression**: Complete levels to unlock new abilities
4. **Scoring**: Each star is worth 9 points
5. **Lives**: Gain extra lives every 200+ points (cost increases)
6. **Abilities**: Unlock powerful abilities as you progress:
   - Level 2+: Double jump, Fast fall
   - Level 3+: Flying stars appear
   - Level 4+: Triple jump, EMP ability
   - Level 5+: Magnetic barrier
   - Level 6+: Super speed, Sonic boom

## 🛠️ Technical Details

- **Engine**: Phaser.js 3
- **Resolution**: 1450x950 (scales to fit screen)
- **Mobile**: Optimized for landscape orientation
- **Browser Support**: Modern browsers with ES6 support

## 📱 Mobile Gaming

For the best mobile experience:
1. Rotate your device to landscape mode
2. Use both thumbs on the controller areas
3. Left thumb controls movement and utilities
4. Right thumb controls actions and power-ups

## 🎯 Game Mechanics

- **Stars**: Must collect all to advance to next level
- **Bombs**: Bounce around the screen - avoid at all costs!
- **Platforms**: Use them strategically for movement
- **Flying Stars**: Appear at level 3+ for bonus challenge
- **Power-ups**: Unlock game-changing abilities as you progress

## 🏆 Scoring System

- **Stars**: 9 points each
- **Level Completion**: Bonus points for completing levels
- **Lives**: Extra life every 200+ points (cost increases each time)
- **High Score**: Automatically saved locally

## 🔧 Setup & Installation

1. Clone this repository
2. Open `index.html` in a modern web browser
3. No build process required - runs directly in browser!

## 📝 Development

The game is structured with:
- `src/scenes/` - Game scenes (Menu, Game, etc.)
- `src/ui/` - User interface components
- `assets/` - Game sprites and images
- `index.html` - Main game launcher

## 🎨 Assets

Game uses sprite-based graphics with animations for:
- Character movement and idle states
- Bomb bouncing animations
- Star collection effects
- Platform and background elements

## 🌟 Future Enhancements

- Additional characters with unique abilities
- More power-ups and special items
- Multiplayer support
- Level editor
- Sound effects and music
- Particle effects for enhanced visuals

---

**Enjoy playing BombDrop!** 🎮💥⭐
