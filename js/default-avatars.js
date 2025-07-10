/**
 * Default Avatar URLs
 * Provides fallback images when models don't have photos
 */

const DEFAULT_AVATARS = {
    female: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'
    ],
    male: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop'
    ]
};

/**
 * Get a random default avatar based on index
 */
function getDefaultAvatar(index = 0) {
    const allAvatars = [...DEFAULT_AVATARS.female, ...DEFAULT_AVATARS.male];
    return allAvatars[index % allAvatars.length];
}

// Export for use
window.DEFAULT_AVATARS = DEFAULT_AVATARS;
window.getDefaultAvatar = getDefaultAvatar;