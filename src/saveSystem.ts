export interface SaveData {
    points: number;
    unlockedStages: number;
    upgrades: {
        fireDamage: number;
        iceSlow: number;
        thunderDamage: number;
        baseHealth: number;
        towerRange: number;
        unlockedSP: number;
        spCap: number;
        spGenRate: number;
        unlockedFreeze: number;
        unlockedStorm: number;
        unlockedPoison: number;
        unlockedWind: number;
        unlockedEarth: number;
        unlockedLight: number;
        unlockedDark: number;
        unlockedWater: number;
        unlockedNature: number;
        unlockedArcane: number;
        unlockedLava: number;
        unlockedMetal: number;
        unlockedHeal: number;
        unlockedHaste: number;
        unlockedEmpower: number;
        unlockedPoisonCloud: number;
        unlockedBlackhole: number;
        unlockedGoldRush: number;
        unlockedShockwave: number;
        unlockedBarrier: number;
        unlockedArmageddon: number;
        unlockedTimeWarp: number;
    };
    customDecks: { towers: string[], skills: string[] }[];
    activeDeckIndex: number;
}

const DEFAULT_SAVE: SaveData = {
    points: 0,
    unlockedStages: 1,
    upgrades: {
        fireDamage: 0,
        iceSlow: 0,
        thunderDamage: 0,
        baseHealth: 0,
        towerRange: 0,
        unlockedSP: 0,
        spCap: 0,
        spGenRate: 0,
        unlockedFreeze: 0,
        unlockedStorm: 0,
        unlockedPoison: 0,
        unlockedWind: 0,
        unlockedEarth: 0,
        unlockedLight: 0,
        unlockedDark: 0,
        unlockedWater: 0,
        unlockedNature: 0,
        unlockedArcane: 0,
        unlockedLava: 0,
        unlockedMetal: 0,
        unlockedHeal: 0,
        unlockedHaste: 0,
        unlockedEmpower: 0,
        unlockedPoisonCloud: 0,
        unlockedBlackhole: 0,
        unlockedGoldRush: 0,
        unlockedShockwave: 0,
        unlockedBarrier: 0,
        unlockedArmageddon: 0,
        unlockedTimeWarp: 0,
    },
    customDecks: [
        { towers: ['fire', 'ice', 'thunder'], skills: ['meteor', 'freeze', 'storm'] },
        { towers: ['fire', 'ice', 'thunder'], skills: ['meteor', 'freeze', 'storm'] },
        { towers: ['fire', 'ice', 'thunder'], skills: ['meteor', 'freeze', 'storm'] }
    ],
    activeDeckIndex: 0,
};

const SAVE_KEY = 'mcd_save';

export function loadSaveData(): SaveData {
    try {
        const data = localStorage.getItem(SAVE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            let loadedDecks = parsed.customDecks ?? DEFAULT_SAVE.customDecks;
            if (parsed.deckTowers && !parsed.customDecks) {
                loadedDecks = [
                    { towers: parsed.deckTowers, skills: parsed.deckSkills ?? [] },
                    ...DEFAULT_SAVE.customDecks.slice(1)
                ];
            }

            return {
                ...DEFAULT_SAVE,
                ...parsed,
                unlockedStages: parsed.unlockedStages ?? 1,
                upgrades: { ...DEFAULT_SAVE.upgrades, ...parsed.upgrades },
                customDecks: loadedDecks,
                activeDeckIndex: parsed.activeDeckIndex ?? 0,
            };
        }
    } catch (e) {
        console.error("Failed to load save data", e);
    }
    return DEFAULT_SAVE;
}

export function saveGameData(data: SaveData) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save game data", e);
    }
}
