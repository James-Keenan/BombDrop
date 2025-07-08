// Utility: Force refresh of achievements UI (call this after updating achievements or when opening the menu)
export function refreshAchievementsUI(scene) {
    showAchievements(scene);
}

// (Tier helpers removed: no longer needed)
// achievements.js
// UI overlay for achievements in BombDrop
// Exports a function to show the achievements UI and handle progress display

// No more difficulty levels; achievements are now grouped by type or theme only
// (UI will show all achievements in a single scrollable list)

// Base achievements (all will be expanded to 3 tiers)
// Expanded with more UI/interaction achievements
const BASE_ACHIEVEMENTS = [
    // --- Difficulty Mode Achievements ---
    { key: 'gamesEasy', baseName: 'Easy Mode Player', baseDesc: 'Play games on Easy mode.', type: 'gamesEasy', goals: [1, 10, 50], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'gamesNormal', baseName: 'Normal Mode Player', baseDesc: 'Play games on Normal mode.', type: 'gamesNormal', goals: [1, 10, 50], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'gamesExpert', baseName: 'Expert Mode Player', baseDesc: 'Play games on Expert mode.', type: 'gamesExpert', goals: [1, 5, 20], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'gamesMaster', baseName: 'Master Mode Player', baseDesc: 'Play games on Master mode.', type: 'gamesMaster', goals: [1, 3, 10], difficulties: ['normal', 'gifted', 'master'] },
    { key: 'winEasy', baseName: 'Easy Mode Victor', baseDesc: 'Win games on Easy mode.', type: 'winEasy', goals: [1, 5, 20], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'winNormal', baseName: 'Normal Mode Victor', baseDesc: 'Win games on Normal mode.', type: 'winNormal', goals: [1, 5, 20], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'winExpert', baseName: 'Expert Mode Victor', baseDesc: 'Win games on Expert mode.', type: 'winExpert', goals: [1, 3, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'winMaster', baseName: 'Master Mode Victor', baseDesc: 'Win games on Master mode.', type: 'winMaster', goals: [1, 2, 5], difficulties: ['gifted', 'expert', 'master'] },
    // Rookie (20)
    { key: 'stars', baseName: 'Star Collector', baseDesc: 'Collect stars.', type: 'stars', goals: [1000, 5000, 20000], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'bombs_avoided', baseName: 'Bomb Dodger', baseDesc: 'Survive bombs.', type: 'bombs_avoided', goals: [100, 1000, 2500], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'level', baseName: 'Level Up', baseDesc: 'Reach levels.', type: 'level', goals: [10, 50, 100], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'deaths', baseName: 'Fallen', baseDesc: 'Lose lives.', type: 'deaths', goals: [100, 500, 1000], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'wins', baseName: 'Victor', baseDesc: 'Win games.', type: 'wins', goals: [10, 50, 100], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'upgrades', baseName: 'Upgrade Buyer', baseDesc: 'Buy upgrades.', type: 'upgrades', goals: [50, 100, 200], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'tokens', baseName: 'Token Collector', baseDesc: 'Collect tokens.', type: 'tokens', goals: [1000, 5000, 10000], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'barrier', baseName: 'Barrier User', baseDesc: 'Use Barrier.', type: 'barrier', goals: [50, 100, 250], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'emp', baseName: 'EMP User', baseDesc: 'Use EMP.', type: 'emp', goals: [50, 100, 250], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'sonic', baseName: 'Sonic Boomer', baseDesc: 'Use Sonic Boom.', type: 'sonic', goals: [50, 100, 250], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'platformDrop', baseName: 'Platform Dropper', baseDesc: 'Drop through platforms.', type: 'platformDrop', goals: [100, 500, 1000], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'zeroGravity', baseName: 'Zero Gravity', baseDesc: 'Use Zero Gravity.', type: 'zeroGravity', goals: [100, 200, 500], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'catsbyUnlocked', baseName: 'Unlock CATsby', baseDesc: 'Unlock CATsby as a playable character.', type: 'catsbyUnlocked', goals: [1], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'robotUnlocked', baseName: 'Unlock Tekno', baseDesc: 'Unlock Tekno as a playable character.', type: 'robotUnlocked', goals: [1], difficulties: ['rookie', 'normal', 'gifted'] },
    // Play as each character (rookie tier)
    { key: 'dudePlayed', baseName: 'Play as Dude', baseDesc: 'Play a game as Dude.', type: 'dudePlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'catPlayed', baseName: 'Play as CATsby', baseDesc: 'Play a game as CATsby.', type: 'catPlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'robotPlayed', baseName: 'Play as Tekno', baseDesc: 'Play a game as Tekno.', type: 'robotPlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'gabbiePlayed', baseName: 'Play as Gabbie', baseDesc: 'Play a game as Gabbie.', type: 'gabbiePlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'plutoPlayed', baseName: 'Play as Pluto', baseDesc: 'Play a game as Pluto.', type: 'plutoPlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'petePlayed', baseName: 'Play as Pete', baseDesc: 'Play a game as Pete.', type: 'petePlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    // Win as each character (normal tier)
    { key: 'dudeWin', baseName: 'Dude Winner', baseDesc: 'Win as Dude.', type: 'dudeWin', goals: [1, 3, 7], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'catWin', baseName: 'CATsby Winner', baseDesc: 'Win as CATsby.', type: 'catWin', goals: [1, 3, 7], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'robotWin', baseName: 'Tekno Winner', baseDesc: 'Win as Tekno.', type: 'robotWin', goals: [1, 3, 7], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'gabbieWin', baseName: 'Gabbie Winner', baseDesc: 'Win as Gabbie.', type: 'gabbieWin', goals: [1, 3, 7], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'plutoWin', baseName: 'Pluto Winner', baseDesc: 'Win as Pluto.', type: 'plutoWin', goals: [1, 3, 7], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'peteWin', baseName: 'Pete Winner', baseDesc: 'Win as Pete.', type: 'peteWin', goals: [1, 3, 7], difficulties: ['normal', 'gifted', 'expert'] },
    // --- UI/Interaction Achievements ---
    { key: 'openAchievements', baseName: 'Achievement Hunter', baseDesc: 'Open the Achievements screen.', type: 'openAchievements', goals: [1, 5, 20], difficulties: [] },
    { key: 'openSettings', baseName: 'Settings Explorer', baseDesc: 'Open the Settings screen.', type: 'openSettings', goals: [1, 5, 20], difficulties: [] },
    { key: 'changeTheme', baseName: 'Theme Changer', baseDesc: 'Change the game theme.', type: 'changeTheme', goals: [1, 3, 10], difficulties: [] },
    { key: 'muteMusic', baseName: 'Silence is Golden', baseDesc: 'Mute the music.', type: 'muteMusic', goals: [1], difficulties: [] },
    { key: 'muteSFX', baseName: 'Quiet Please', baseDesc: 'Mute the sound effects.', type: 'muteSFX', goals: [1], difficulties: [] },
    { key: 'fullscreen', baseName: 'Full Immersion', baseDesc: 'Enter fullscreen mode (PC or mobile).', type: 'fullscreen', goals: [1, 3, 10], difficulties: [] },
    { key: 'visitCredits', baseName: 'Credit Where Due', baseDesc: 'Open the Credits screen.', type: 'visitCredits', goals: [1], difficulties: [] },
    { key: 'mapOnePlayed', baseName: "Turnup's Trail", baseDesc: 'Play on Turnup\'s Trail.', type: 'mapOnePlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'catsbyCornerPlayed', baseName: "Catsby's Corner", baseDesc: 'Play on Catsby\'s Corner.', type: 'catsbyCornerPlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'robotMapPlayed', baseName: "Tekno's Terminal", baseDesc: 'Play on Tekno\'s Terminal.', type: 'robotMapPlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'gabbiesGravePlayed', baseName: "Gabbie's Grave", baseDesc: 'Play on Gabbie\'s Grave.', type: 'gabbiesGravePlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'peteStreetPlayed', baseName: "Pete's Street", baseDesc: 'Play on Pete\'s Street.', type: 'peteStreetPlayed', goals: [1, 5, 15], difficulties: ['rookie', 'normal', 'gifted'] },
    // Win on each map (normal tier)
    { key: 'mapOneWin', baseName: "Turnup's Trail Winner", baseDesc: 'Win on Turnup\'s Trail.', type: 'mapOneWin', goals: [1], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'catsbyCornerWin', baseName: "Catsby's Corner Winner", baseDesc: 'Win on Catsby\'s Corner.', type: 'catsbyCornerWin', goals: [1], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'robotMapWin', baseName: "Tekno's Terminal Winner", baseDesc: 'Win on Tekno\'s Terminal.', type: 'robotMapWin', goals: [1], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'gabbiesGraveWin', baseName: "Gabbie's Grave Winner", baseDesc: 'Win on Gabbie\'s Grave.', type: 'gabbiesGraveWin', goals: [1], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'peteStreetWin', baseName: "Pete's Street Winner", baseDesc: 'Win on Pete\'s Street.', type: 'peteStreetWin', goals: [1], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'jump_100', baseName: 'Jumper', baseDesc: 'Jump times.', type: 'jumps', goals: [10, 50, 100], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'settings_1', baseName: 'Tinkerer', baseDesc: 'Change a setting.', type: 'settingsChanged', goals: [1], difficulties: ['rookie', 'normal', 'gifted'] },
    { key: 'menu_1', baseName: 'Menu Explorer', baseDesc: 'Open the main menu.', type: 'menuOpened', goals: [1, 3, 5], difficulties: ['rookie', 'normal', 'gifted'] },

    // Normal (20)
    { key: 'star_50', baseName: 'Star Gatherer', baseDesc: 'Collect stars in one game.', type: 'starsSingle', goals: [10, 25, 50], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'bomb_20', baseName: 'Bomb Handler', baseDesc: 'Survive bombs in one game.', type: 'bombsSingle', goals: [5, 10, 20], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'deathless_1', baseName: 'No Death', baseDesc: 'Complete a game without dying.', type: 'deathless', goals: [1, 3, 5], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'token_200', baseName: 'Token Hoarder', baseDesc: 'Collect tokens in one game.', type: 'tokensSingle', goals: [20, 50, 100], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'upgrade_20', baseName: 'Upgrade Fanatic', baseDesc: 'Buy upgrades in one game.', type: 'upgradesSingle', goals: [2, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'barrier_uses', baseName: 'Barrier Master', baseDesc: 'Use Barrier in one game.', type: 'barrierSingle', goals: [2, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'emp_uses', baseName: 'EMP Master', baseDesc: 'Use EMP in one game.', type: 'empSingle', goals: [2, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'sonic_uses', baseName: 'Sonic Master', baseDesc: 'Use Sonic Boom in one game.', type: 'sonicSingle', goals: [2, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'platform_uses', baseName: 'Platform Master', baseDesc: 'Drop through platforms in one game.', type: 'platformDropSingle', goals: [2, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'zero_uses', baseName: 'Zero Gravity Master', baseDesc: 'Use Zero Gravity in one game.', type: 'zeroGravitySingle', goals: [2, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'cat_play', baseName: 'CATsby Main', baseDesc: 'Play as CATsby.', type: 'catPlayed', goals: [1, 5, 15], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'robot_play', baseName: 'Tekno Main', baseDesc: 'Play as Tekno.', type: 'robotPlayed', goals: [1, 5, 15], difficulties: ['normal', 'gifted', 'expert'] },
    // Gabbie (formerly Zara) win achievement
    { key: 'gabbieWin', baseName: 'Gabbie Winner', baseDesc: 'Win as Gabbie.', type: 'gabbieWin', goals: [1, 3, 7], difficulties: ['normal', 'gifted', 'expert'] },
    // Removed duplicate/incorrect catWins and robotWins achievements (use catWin and robotWin only)
    { key: 'multi_play', baseName: 'Multiplayer', baseDesc: 'Play a multiplayer game.', type: 'multiplayer', goals: [1, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'coop_play', baseName: 'Co-op', baseDesc: 'Play a co-op game.', type: 'coop', goals: [1, 5, 10], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'map_explore', baseName: 'Explorer', baseDesc: 'Play on every map.', type: 'mapsExplored', goals: [2, 4, 6], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'settings_reset', baseName: 'Resetter', baseDesc: 'Reset your settings.', type: 'settingsReset', goals: [1, 2, 3], difficulties: ['normal', 'gifted', 'expert'] },
    { key: 'menu_return', baseName: 'Menu Returner', baseDesc: 'Return to menu after a game.', type: 'menuReturn', goals: [1, 3, 5], difficulties: ['normal', 'gifted', 'expert'] },

    // Gifted (20)
    { key: 'star_200', baseName: 'Star Hoarder', baseDesc: 'Collect stars in total.', type: 'starsTotal', goals: [50, 100, 200], difficulties: ['gifted', 'expert', 'master'] },
    // All-time star collection achievement (5000 stars)
    { key: 'star_legend', baseName: 'Star Legend', baseDesc: 'Collect 5000 stars all-time.', type: 'starsTotal', goals: [5000], difficulties: [] },
    // All-time star collection achievement (5000 stars)
    { key: 'star_5000_total', baseName: 'Star Legend', baseDesc: 'Collect 5000 stars all-time.', type: 'starsTotal', goals: [5000], difficulties: [] },
    { key: 'bomb_50', baseName: 'Bomb Veteran', baseDesc: 'Survive bombs in total.', type: 'bombsTotal', goals: [20, 35, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'death_50', baseName: 'Fallen Veteran', baseDesc: 'Lose lives in total.', type: 'deathsTotal', goals: [20, 35, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'win_50', baseName: 'Winning Streak', baseDesc: 'Win games in total.', type: 'winsTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'upgrade_50', baseName: 'Upgrade Collector', baseDesc: 'Buy upgrades in total.', type: 'upgradesTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'token_500', baseName: 'Token Tycoon', baseDesc: 'Collect tokens in total.', type: 'tokensTotal', goals: [100, 250, 500], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'barrier_uses_total', baseName: 'Barrier Legend', baseDesc: 'Use Barrier in total.', type: 'barrierTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'emp_uses_total', baseName: 'EMP Legend', baseDesc: 'Use EMP in total.', type: 'empTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'sonic_uses_total', baseName: 'Sonic Legend', baseDesc: 'Use Sonic Boom in total.', type: 'sonicTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'platform_uses_total', baseName: 'Platform Legend', baseDesc: 'Drop through platforms in total.', type: 'platformDropTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'zero_uses_total', baseName: 'Zero Gravity Legend', baseDesc: 'Use Zero Gravity in total.', type: 'zeroGravityTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'cat_play_total', baseName: 'CATsby Legend', baseDesc: 'Play as CATsby in total.', type: 'catPlayedTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'robot_play_total', baseName: 'Tekno Legend', baseDesc: 'Play as Tekno in total.', type: 'robotPlayedTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    // Gabbie (formerly Zara) total play achievement
    { key: 'gabbie_play_total', baseName: 'Gabbie Legend', baseDesc: 'Play as Gabbie in total.', type: 'gabbiePlayedTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'gabbie_play_total', baseName: 'Gabbie Legend', baseDesc: 'Play on Gabbie\'s Grave in total.', type: 'gabbiesGravePlayedTotal', goals: [10, 25, 50], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'jump_500', baseName: 'Jump Master', baseDesc: 'Jump in total.', type: 'jumpsTotal', goals: [100, 250, 500], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'settings_10', baseName: 'Settings Master', baseDesc: 'Change settings in total.', type: 'settingsChangedTotal', goals: [5, 10, 20], difficulties: ['gifted', 'expert', 'master'] },
    { key: 'menu_10', baseName: 'Menu Master', baseDesc: 'Open the main menu in total.', type: 'menuOpenedTotal', goals: [5, 10, 20], difficulties: ['gifted', 'expert', 'master'] }
];

// Super hard/creative one-time expert/master achievements (all possible in-game)
const SPECIAL_ACHIEVEMENTS = [
    // Master achievement: Win on all maps
    { key: 'all_maps_win', name: 'Map Master', desc: 'Win a game on every map.', goal: 1, type: 'allMapsWin', difficulty: 'master' },

    // Master achievement: Win with every character
    { key: 'all_characters_win', name: 'Character Master', desc: 'Win a game with every character.', goal: 1, type: 'allCharactersWin', difficulty: 'master' },

    // Expert achievements: Beat the game with each main character
    { key: 'turnup_expert_win', name: 'Turnup Expert', desc: 'Win a game as Turnup on any map (Expert).', goal: 1, type: 'turnupExpertWin', difficulty: 'expert' },
    { key: 'gabbie_expert_win', name: 'Gabbie Expert', desc: 'Win a game as Gabbie on any map (Expert).', goal: 1, type: 'gabbieExpertWin', difficulty: 'expert' },
    { key: 'catsby_expert_win', name: 'CATsby Expert', desc: 'Win a game as CATsby on any map (Expert).', goal: 1, type: 'catsbyExpertWin', difficulty: 'expert' },
    { key: 'tekno_expert_win', name: 'Tekno Expert', desc: 'Win a game as Tekno on any map (Expert).', goal: 1, type: 'teknoExpertWin', difficulty: 'expert' },
    { key: 'pluto_expert_win', name: 'Pluto Expert', desc: 'Win a game as Pluto on any map (Expert).', goal: 1, type: 'plutoExpertWin', difficulty: 'expert' },
    { key: 'pete_expert_win', name: 'Pete Expert', desc: 'Win a game as Pete on any map (Expert).', goal: 1, type: 'peteExpertWin', difficulty: 'expert' },
    { key: 'no_damage_win', name: 'Untouchable', desc: 'Win a game without taking any damage.', goal: 1, type: 'noDamageWin', difficulty: 'expert' },
    { key: 'no_star_win', name: 'Minimalist', desc: 'Win a game without collecting a single star.', goal: 1, type: 'noStarWin', difficulty: 'expert' },
    { key: 'all_bombs_survived', name: 'Bomb Magnet', desc: 'Survive every bomb in a standard round without dying.', goal: 1, type: 'allBombsSurvived', difficulty: 'expert' },
    { key: 'no_powerups_win', name: 'Pure Skill', desc: 'Win a game without using any powerups.', goal: 1, type: 'noPowerupsWin', difficulty: 'expert' },
    // Only include if all upgrades can be bought in one run:
    // { key: 'all_upgrades_bought', name: 'Fully Loaded', desc: 'Buy every upgrade in a single run.', goal: 1, type: 'allUpgradesBought', difficulty: 'master' },
    { key: 'max_level', name: 'Ascended', desc: 'Reach the maximum level possible.', goal: 1, type: 'maxLevel', difficulty: 'master' },
    { key: 'flawless_run', name: 'Flawless', desc: 'Complete a run without dying or taking damage.', goal: 1, type: 'flawlessRun', difficulty: 'master' },
    // Only include if there are secrets in maps:
    // { key: 'secret_found', name: 'Secret Finder', desc: 'Find the hidden secret in any map.', goal: 1, type: 'secretFound', difficulty: 'master' },
    // Only include if you can win as both Tekno and CATsby in one session:
    // { key: 'robot_cat_win', name: 'Unlikely Duo', desc: 'Win a game as Tekno and CATsby in the same session.', goal: 1, type: 'robotCatWin', difficulty: 'master' },
    { key: 'speedrunner', name: 'Speedrunner', desc: 'Win a game in under 2 minutes.', goal: 1, type: 'speedrunner', difficulty: 'master' }
];

// Remove tiers: each achievement is now a single, high-value goal
const ACHIEVEMENTS = [
    ...BASE_ACHIEVEMENTS.map(base => {
        // Use the highest goal value for each achievement
        const goal = Math.max(...base.goals);
        return {
            key: base.key,
            name: base.baseName,
            desc: `${base.baseDesc} (${goal})`,
            goal,
            type: base.type
        };
    }),
    ...SPECIAL_ACHIEVEMENTS
];

// --- Achievement Progress Storage and Retrieval ---
const ACHIEVEMENT_STORAGE_KEY = 'bombdrop_achievements';

// Returns the achievement progress object from localStorage, or initializes it if missing
function loadAchievementProgress() {
    let data = {};
    try {
        data = JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)) || {};
    } catch (e) {
        data = {};
    }
    return data;
}

// Saves the achievement progress object to localStorage
function saveAchievementProgress(progress) {
    localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(progress));
}

// Increments progress for a given achievement type by a value (default 1)
export function incrementAchievement(type, value = 1) {
    const progress = loadAchievementProgress();
    if (!progress[type]) progress[type] = 0;
    progress[type] += value;
    saveAchievementProgress(progress);
}

// Sets progress for a given achievement type to a specific value (for one-time/flag achievements)
export function setAchievement(type, value = 1) {
    const progress = loadAchievementProgress();
    progress[type] = value;
    saveAchievementProgress(progress);
}

// Gets progress for a given achievement type
export function getAchievementProgress(type) {
    const progress = loadAchievementProgress();
    return progress[type] || 0;
}

// Global getter for UI and filtering logic
window.getProgress = function(ach) {
    // Accepts either {type} or string
    const type = ach && ach.type ? ach.type : ach;
    return getAchievementProgress(type);
};

// Optionally, clear all achievements (for debug/reset)
export function clearAllAchievements() {
    localStorage.removeItem(ACHIEVEMENT_STORAGE_KEY);
}

// Always use a fresh getter to ensure UI is up-to-date
export function showAchievements(scene, getProgress) {
    // Always use a fresh getter that reads from localStorage, regardless of what is passed in
    getProgress = (ach) => {
        const type = ach && ach.type ? ach.type : ach;
        let data = {};
        try {
            data = JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)) || {};
        } catch (e) { data = {}; }
        return data[type] || 0;
    };
    // Increment "openAchievements" achievement every time achievements UI is opened
    try { incrementAchievement('openAchievements'); } catch (e) {}
    // Debug: Log scene and sample progress for troubleshooting
    if (typeof console !== 'undefined') {
        console.log('[Achievements] showAchievements called for scene:', scene && scene.scene && scene.scene.key);
        // Log a few sample achievements to verify progress
        console.log('[Achievements] Sample progress:', {
            gamesExpert: getProgress({type: 'gamesExpert'}),
            winExpert: getProgress({type: 'winExpert'}),
            stars: getProgress({type: 'stars'})
        });
    }
    // --- Force refresh on scene wake (for Phaser 3) ---
    if (scene && scene.events && typeof scene.events.once === 'function') {
        scene.events.once('wake', () => {
            showAchievements(scene, getProgress);
        });
    }
    // --- Always call refreshAchievementsUI(this) in your main menu's achievements button handler ---
    // Clear existing content
    scene.children.removeAll();
    scene.particles = [];

    // Background
    let bg = scene.add.image(725, 475, 'sky').setAlpha(0.95);
    bg.setScale(1450 / bg.width, 950 / bg.height);
    bg.setTint(0x88aaff);

    // Main container
    const achContainer = scene.add.rectangle(725, 475, 1100, 800, 0x111133, 0.97);
    achContainer.setStrokeStyle(6, 0xffcc00);
    const containerGlow = scene.add.rectangle(725, 475, 1120, 820, 0xffcc00, 0.08);

    // Title
    const achTitle = scene.add.text(725, 110, 'ACHIEVEMENTS', {
        fontFamily: 'Arial Black',
        fontSize: 72,
        color: '#ffcc00',
        stroke: '#000033',
        strokeThickness: 10,
        align: 'center',
        shadow: {
            offsetX: 4,
            offsetY: 4,
            color: '#000033',
            blur: 12,
            fill: true
        }
    }).setOrigin(0.5);
    scene.tweens.add({
        targets: achTitle,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Scrollable area for achievements
    const scrollArea = scene.add.rectangle(725, 475, 900, 540, 0x222244, 0.93).setStrokeStyle(3, 0xffcc00);
    scrollArea.setOrigin(0.5);
    const maskShape = scene.make.graphics({x:0, y:0, add:false});
    maskShape.fillRect(275, 205, 900, 540);
    const mask = maskShape.createGeometryMask();

    // Render all achievements in a single scrollable list
    const textContainer = scene.add.container(275, 205);
    let y = 0;
    ACHIEVEMENTS.forEach((ach, i) => {
        const progress = (typeof getProgress === 'function') ? getProgress(ach) : 0;
        const percent = Math.min(1, progress / ach.goal);
        const isComplete = percent >= 1;
        const achBox = scene.add.rectangle(450, y + 40, 860, 70, isComplete ? 0x44ff66 : 0x333355, isComplete ? 0.18 : 0.10).setStrokeStyle(2, isComplete ? 0xffcc00 : 0x8888aa);
        const name = scene.add.text(60, y + 10, ach.name, {
            fontFamily: 'Arial Black', fontSize: 32, color: isComplete ? '#ffe066' : '#fff', stroke: '#000', strokeThickness: 4
        });
        const desc = scene.add.text(60, y + 44, ach.desc, {
            fontFamily: 'Arial', fontSize: 22, color: '#cccccc', stroke: '#000', strokeThickness: 2
        });
        // --- Show achievement description on click ---
        [achBox, name, desc].forEach(obj => {
            obj.setInteractive({ useHandCursor: true });
            obj.on('pointerdown', () => {
                // Remove any previous popup
                if (scene._achPopup) scene._achPopup.destroy();
                scene._achPopup = scene.add.text(725, 700, `How to unlock: ${ach.desc}`, {
                    fontFamily: 'Arial Black', fontSize: 32, color: '#fff', stroke: '#000', strokeThickness: 6, align: 'center', backgroundColor: '#222', padding: { left: 20, right: 20, top: 10, bottom: 10 }
                }).setOrigin(0.5).setDepth(9999);
                scene.time.delayedCall(3500, () => { if (scene._achPopup) { scene._achPopup.destroy(); scene._achPopup = null; } }, [], scene);
            });
        });
        if (isComplete) {
            // Show complete text instead of progress bar
            const completeText = scene.add.text(700, y + 45, 'Complete!', {
                fontFamily: 'Arial Black', fontSize: 26, color: '#44ff66', stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5);
            textContainer.add([achBox, name, desc, completeText]);
        } else {
            // Progress bar
            const barBg = scene.add.rectangle(700, y + 45, 260, 18, 0x222222, 0.7);
            const bar = scene.add.rectangle(570, y + 45, Math.max(8, 260 * percent), 18, 0xffcc00, 0.7).setOrigin(0, 0.5);
            // Progress text stays to the left of the bar
            const progressText = scene.add.text(570 - 10, y + 45, `${Math.floor(progress)}/${ach.goal}`, {
                fontFamily: 'Arial Black', fontSize: 20, color: '#fff', stroke: '#000', strokeThickness: 3, align: 'right'
            }).setOrigin(1, 0.5);
            textContainer.add([achBox, name, desc, barBg, bar, progressText]);
        }
        y += 80;
    });
    textContainer.setMask(mask);

    // Scrollbar UI (same as rules)
    const scrollBarHeight = 540;
    const scrollBarY = 475;
    const scrollBarX = 1200;
    // Thicker scroll bar for mobile and desktop thumb usability
    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const barWidth = isMobile ? 80 : 56;
    const barThumbHeight = isMobile ? 200 : 150;
    const barBg = scene.add.rectangle(scrollBarX, scrollBarY, barWidth, scrollBarHeight, 0x333300, 0.7);
    const bar = scene.add.rectangle(scrollBarX, scrollBarY - scrollBarHeight/2 + 40, barWidth, barThumbHeight, 0xffcc00, 0.95).setInteractive({ draggable: true });
    bar.setOrigin(0.5, 0);
    let dragging = false;
    let dragOffsetY = 0;
    bar.on('pointerdown', (pointer) => { dragging = true; dragOffsetY = pointer.y - bar.y; });
    bar.on('drag', (pointer, dragX, dragY) => {
        if (dragging) {
            let newY = pointer.y - dragOffsetY;
            newY = Math.max(scrollBarY - scrollBarHeight/2, Math.min(scrollBarY + scrollBarHeight/2 - bar.height, newY));
            bar.y = newY;
            const scrollPercent = (bar.y - (scrollBarY - scrollBarHeight/2)) / (scrollBarHeight - bar.height);
            const maxScroll = Math.max(0, y - 540);
            textContainer.y = 205 - scrollPercent * maxScroll;
        }
    });
    scene.input.on('pointerup', () => { dragging = false; });
    scene.input.on('pointermove', (pointer) => {
        if (dragging) {
            let newY = pointer.y - dragOffsetY;
            newY = Math.max(scrollBarY - scrollBarHeight/2, Math.min(scrollBarY + scrollBarHeight/2 - bar.height, newY));
            bar.y = newY;
            const scrollPercent = (bar.y - (scrollBarY - scrollBarHeight/2)) / (scrollBarHeight - bar.height);
            const maxScroll = Math.max(0, y - 540);
            textContainer.y = 205 - scrollPercent * maxScroll;
        }
    });
    // Mouse wheel scroll (slower)
    scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
        let scroll = (bar.y - (scrollBarY - scrollBarHeight/2)) + deltaY * 0.08; // slower scroll
        scroll = Math.max(0, Math.min(scrollBarHeight - bar.height, scroll));
        bar.y = scrollBarY - scrollBarHeight/2 + scroll;
        const scrollPercent = scroll / (scrollBarHeight - bar.height);
        const maxScroll = Math.max(0, y - 540);
        textContainer.y = 205 - scrollPercent * maxScroll;
    });
    // Touch scroll (slower)
    let lastPointerY = null;
    scrollArea.setInteractive();
    scrollArea.on('pointerdown', (pointer) => { lastPointerY = pointer.y; });
    scrollArea.on('pointerup', () => { lastPointerY = null; });
    scrollArea.on('pointermove', (pointer) => {
        if (lastPointerY !== null) {
            let dy = pointer.y - lastPointerY;
            lastPointerY = pointer.y;
            let scroll = (bar.y - (scrollBarY - scrollBarHeight/2)) - dy * 0.4; // slower scroll
            scroll = Math.max(0, Math.min(scrollBarHeight - bar.height, scroll));
            bar.y = scrollBarY - scrollBarHeight/2 + scroll;
            const scrollPercent = scroll / (scrollBarHeight - bar.height);
            const maxScroll = Math.max(0, y - 540);
            textContainer.y = 205 - scrollPercent * maxScroll;
        }
    });
    // Back button
    scene.createDynamicButton(725, 800, 'BACK TO MENU', '#ff4466', '#ff6688', () => {
        // Switch back to the main menu scene
        if (scene.scene && typeof scene.scene.start === 'function') {
            scene.scene.start('MainMenu');
        }
    });
}

// Utility: Get the 3 closest-to-complete achievements (not yet completed)
export function getClosestAchievements(getProgress = window.getProgress, count = 3) {
    // Only consider achievements with progress < goal
    const incomplete = ACHIEVEMENTS.filter(ach => {
        const progress = getProgress(ach);
        return progress < ach.goal;
    });
    // Sort by percent complete, descending
    incomplete.sort((a, b) => {
        const pa = getProgress(a) / a.goal;
        const pb = getProgress(b) / b.goal;
        return pb - pa;
    });
    return incomplete.slice(0, count);
}
// Removed stray scene.createDynamicMenu(); that caused ReferenceError
