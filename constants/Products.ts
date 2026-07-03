export const PRODUCT_IDS = [
    'com.iftsoftware.snoozetax.tier1', // Mild ($0.99)
    'com.iftsoftware.snoozetax.tier2', // Medium ($2.99)
    'com.iftsoftware.snoozetax.tier3', // Harsh ($4.99)
    'com.iftsoftware.snoozetax.tier4', // Nuclear ($9.99)
];

// Legacy IDs used in development/EAS default builds
// We query these too so existing alarms work without crashing
export const LEGACY_PRODUCT_IDS = [
    'com.anonymous.snoozetax.tier1',
    'com.anonymous.snoozetax.tier2',
    'com.anonymous.snoozetax.tier3',
    'com.anonymous.snoozetax.tier4',
    'com.snoozetax.tier1',
    'com.snoozetax.tier2',
    'com.snoozetax.tier3',
    'com.snoozetax.tier4',
];

export const ALL_PRODUCT_IDS = [...PRODUCT_IDS, ...LEGACY_PRODUCT_IDS];

export const PENALTY_TIERS = [
    { id: 'com.iftsoftware.snoozetax.tier1', labelKey: 'tier_mild', emoji: '🐣', amount: 0.99, display: '$0.99' },
    { id: 'com.iftsoftware.snoozetax.tier2', labelKey: 'tier_medium', emoji: '😬', amount: 2.99, display: '$2.99' },
    { id: 'com.iftsoftware.snoozetax.tier3', labelKey: 'tier_harsh', emoji: '🔥', amount: 4.99, display: '$4.99' },
    { id: 'com.iftsoftware.snoozetax.tier4', labelKey: 'tier_nuclear', emoji: '💀', amount: 9.99, display: '$9.99' },
];
