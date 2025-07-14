// Celebrity Models Migration Script
// Migrates pre-existing celebrity models to the new face licensing database structure

// Celebrity model data
const celebrityModels = [
    {
        id: 'model_chae_001',
        name: '채연',
        email: 'chae@xbrush.ai',
        phone: '010-0000-0001',
        birthDate: '1978-12-10',
        gender: 'female',
        profileImage: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/chae.png',
        tagline: '우아하고 세련된 이미지',
        introduction: '드라마와 영화에서 활약한 베테랑 배우. 고급스럽고 신뢰감 있는 이미지로 프리미엄 브랜드 광고에 적합합니다.',
        categories: ['beauty', 'fashion', 'lifestyle'],
        attributes: ['우아함', '신뢰감', '고급스러움'],
        tier: 'premium',
        sortPriority: 5000
    },
    {
        id: 'model_iu_001',
        name: '아이유',
        email: 'iu@xbrush.ai',
        phone: '010-0000-0002',
        birthDate: '1993-05-16',
        gender: 'female',
        profileImage: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/2.png',
        tagline: '사랑스럽고 친근한 이미지',
        introduction: '가수 겸 배우로 활동하며 대중적인 사랑을 받는 스타. 다양한 연령층에게 어필하는 친근한 이미지.',
        categories: ['beauty', 'food', 'lifestyle'],
        attributes: ['친근함', '사랑스러움', '다재다능'],
        tier: 'vip',
        sortPriority: 9000
    },
    {
        id: 'model_ljj_001',
        name: '이정재',
        email: 'ljj@xbrush.ai',
        phone: '010-0000-0003',
        birthDate: '1972-12-15',
        gender: 'male',
        profileImage: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/3.png',
        tagline: '카리스마 있는 신사적 이미지',
        introduction: '오징어 게임으로 세계적 스타가 된 배우. 중후하고 신뢰감 있는 이미지로 기업 광고에 적합.',
        categories: ['corporate', 'tech', 'lifestyle'],
        attributes: ['카리스마', '신뢰감', '글로벌'],
        tier: 'vip',
        sortPriority: 8000
    },
    {
        id: 'model_jjh_001',
        name: '전지현',
        email: 'jjh@xbrush.ai',
        phone: '010-0000-0004',
        birthDate: '1981-10-30',
        gender: 'female',
        profileImage: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/4.png',
        tagline: '도시적이고 세련된 이미지',
        introduction: '별에서 온 그대로 아시아 전역에서 사랑받는 톱스타. 패션과 뷰티 브랜드의 뮤즈.',
        categories: ['fashion', 'beauty', 'lifestyle'],
        attributes: ['세련됨', '도시적', '국제적'],
        tier: 'premium',
        sortPriority: 6000
    },
    {
        id: 'model_psj_001',
        name: '박서준',
        email: 'psj@xbrush.ai',
        phone: '010-0000-0005',
        birthDate: '1988-12-16',
        gender: 'male',
        profileImage: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/5.png',
        tagline: '건강하고 활동적인 이미지',
        introduction: '이태원 클라쓰로 큰 사랑을 받은 배우. 젊고 역동적인 이미지로 스포츠, 패션 브랜드에 적합.',
        categories: ['sports', 'fashion', 'lifestyle'],
        attributes: ['활동적', '젊음', '트렌디'],
        tier: 'premium',
        sortPriority: 4000
    },
    {
        id: 'model_lsa_001',
        name: '이상아',
        email: 'lsa@xbrush.ai',
        phone: '010-0000-0007',
        birthDate: '1972-02-15',
        gender: 'female',
        profileImage: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/15.png', // Assuming she might be image 15
        tagline: '자연스럽고 편안한 이미지',
        introduction: '오랜 경력의 배우로 편안하고 신뢰감 있는 이미지. 가족 브랜드와 생활용품 광고에 적합.',
        categories: ['lifestyle', 'food', 'family'],
        attributes: ['편안함', '신뢰감', '친근함'],
        tier: 'premium',
        sortPriority: 4500,
        sampleVideo: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/안동 사과 TVCM 18s 버전 모델 이상아.mp4'
    },
    {
        id: 'model_syj_001',
        name: '손예진',
        email: 'syj@xbrush.ai',
        phone: '010-0000-0006',
        birthDate: '1982-01-11',
        gender: 'female',
        profileImage: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/6.png',
        tagline: '지적이고 우아한 이미지',
        introduction: '사랑의 불시착으로 전 세계적 인기를 얻은 배우. 품격 있고 지적인 이미지로 프리미엄 브랜드에 적합.',
        categories: ['beauty', 'fashion', 'corporate'],
        attributes: ['우아함', '지적', '품격'],
        tier: 'premium',
        sortPriority: 5500
    }
];

// Default licensing plans for each model
const defaultLicensingPlans = [
    {
        planName: '온라인 베이직',
        usageScope: '온라인 광고',
        duration: '6개월',
        territory: '국내',
        basePrice: 5000000, // 5백만원 (celebrities are more expensive)
        platformFee: 15,
        restrictions: 'SNS, 웹사이트만',
        isActive: true
    },
    {
        planName: '온라인 프리미엄',
        usageScope: '온라인 광고',
        duration: '12개월',
        territory: '전세계',
        basePrice: 15000000, // 1천5백만원
        platformFee: 15,
        restrictions: '모든 온라인 채널',
        isActive: true
    },
    {
        planName: '방송 광고',
        usageScope: 'TV/방송',
        duration: '3개월',
        territory: '국내',
        basePrice: 30000000, // 3천만원
        platformFee: 10,
        restrictions: '지상파, 케이블',
        isActive: true
    },
    {
        planName: '전체 상업용',
        usageScope: '모든 매체',
        duration: '12개월',
        territory: '전세계',
        basePrice: 50000000, // 5천만원
        platformFee: 10,
        restrictions: '제한 없음',
        isActive: true
    }
];

// Migration function
async function migrateCelebrityModels() {
    console.log('Starting celebrity models migration...');
    
    try {
        // Wait for Firebase to be ready
        let retries = 10;
        while (retries > 0 && (!window.firebaseDB || !window.modelStorageAdapter)) {
            console.log('Waiting for Firebase initialization...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
        }
        
        if (!window.modelStorageAdapter) {
            throw new Error('Firebase not initialized');
        }
        
        // Migrate each celebrity model
        for (const celebrity of celebrityModels) {
            console.log(`Migrating ${celebrity.name}...`);
            
            // 1. Create model record (private info)
            const modelData = {
                id: celebrity.id,
                modelId: celebrity.id,
                name: celebrity.name,
                email: celebrity.email,
                phone: celebrity.phone,
                birthDate: celebrity.birthDate,
                gender: celebrity.gender,
                kyc_status: 'verified', // Celebrities are pre-verified
                kyc_documents: {
                    id: 'verified',
                    face: 'verified',
                    video: 'verified'
                },
                bankAccount: '계좌정보 보호됨',
                status: 'active',
                joinedAt: new Date().toISOString(),
                
                // For backward compatibility
                personalInfo: {
                    name: celebrity.name,
                    email: celebrity.email,
                    phone: celebrity.phone,
                    birthDate: celebrity.birthDate,
                    gender: celebrity.gender,
                    intro: celebrity.tagline,
                    description: celebrity.introduction,
                    categories: celebrity.categories
                },
                
                // Profile data
                tier: celebrity.tier,
                premiumBadge: celebrity.tier === 'vip' ? '💎 VIP 모델' : '⭐ 프리미엄 모델',
                sortPriority: celebrity.sortPriority,
                
                // Portfolio
                portfolio: {
                    thumbnailUrl: celebrity.profileImage,
                    images: [celebrity.profileImage]
                },
                
                // Additional fields for compatibility
                displayName: celebrity.name,
                tagline: celebrity.tagline,
                introduction: celebrity.introduction,
                categories: celebrity.categories,
                attributes: celebrity.attributes,
                profileImage: celebrity.profileImage,
                totalLicenses: Math.floor(Math.random() * 200) + 100, // Random number for demo
                rating: (Math.random() * 0.5 + 4.5).toFixed(1), // 4.5-5.0 rating
                responseTime: '즉시 가능',
                isActive: true,
                
                // Contract (for backward compatibility)
                contract: {
                    basePrice: defaultLicensingPlans[0].basePrice,
                    currency: 'KRW'
                }
            };
            
            // Save model
            try {
                await window.modelStorageAdapter.saveModel(modelData);
                console.log(`✅ Successfully migrated ${celebrity.name}`);
            } catch (error) {
                console.error(`❌ Failed to migrate ${celebrity.name}:`, error);
            }
        }
        
        console.log('✨ Celebrity models migration completed!');
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast('유명인 모델 마이그레이션이 완료되었습니다!', 'success');
        }
        
        return true;
        
    } catch (error) {
        console.error('Migration failed:', error);
        if (typeof showToast === 'function') {
            showToast('마이그레이션 중 오류가 발생했습니다.', 'error');
        }
        return false;
    }
}

// Auto-run migration when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', migrateCelebrityModels);
} else {
    migrateCelebrityModels();
}

// Export for manual use
window.migrateCelebrityModels = migrateCelebrityModels;