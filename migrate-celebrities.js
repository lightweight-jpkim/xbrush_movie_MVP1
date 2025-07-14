// Celebrity Models Migration Script
// Migrates Korean celebrity models to Firebase

const celebrities = [
    {
        name: "채연",
        englishName: "Chaeyeon",
        gender: "female",
        age: "20대",
        tags: ["상큼한", "발랄한", "친근한", "젊은"],
        description: "상큼한 20대 채연의 모습 그대로",
        tier: "premium",
        price: 100,
        image: "https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/actor1.jpg",
        categories: ["광고", "SNS", "뷰티"],
        portfolio: {
            videos: ["샘플 광고 1", "SNS 캠페인"],
            experience: "2년"
        }
    },
    {
        name: "이상아",
        englishName: "Lee Sang-ah",
        gender: "female",
        age: "30대",
        tags: ["밝은", "친근한", "매력적인", "국민적"],
        description: "밝고 친근한 국민적 매력",
        tier: "premium",
        price: 100,
        image: "https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/actor2.jpg",
        categories: ["광고", "방송", "기업"],
        portfolio: {
            videos: ["기업 광고", "제품 홍보"],
            experience: "5년"
        }
    },
    {
        name: "이정재",
        englishName: "Lee Jung-jae",
        gender: "male",
        age: "40대",
        tags: ["카리스마", "믿음직한", "리더십", "중후한"],
        description: "카리스마 있고 믿음직한 리더십",
        tier: "premium",
        price: 100,
        image: "https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/actor3.jpg",
        categories: ["기업", "럭셔리", "광고"],
        portfolio: {
            videos: ["럭셔리 브랜드", "기업 홍보"],
            experience: "10년"
        }
    },
    {
        name: "전지현",
        englishName: "Jun Ji-hyun",
        gender: "female",
        age: "30대",
        tags: ["우아한", "세련된", "고급스러운", "여성적"],
        description: "우아하고 세련된 여성 매력",
        tier: "premium",
        price: 100,
        image: "https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/actor4.jpg",
        categories: ["럭셔리", "뷰티", "패션"],
        portfolio: {
            videos: ["럭셔리 광고", "화장품 CF"],
            experience: "8년"
        }
    },
    {
        name: "박서준",
        englishName: "Park Seo-jun",
        gender: "male",
        age: "30대",
        tags: ["젊은", "역동적", "현대적", "트렌디"],
        description: "젊고 역동적인 현대적 매력",
        tier: "premium",
        price: 100,
        image: "https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/actor5.jpg",
        categories: ["패션", "스포츠", "라이프스타일"],
        portfolio: {
            videos: ["스포츠 브랜드", "패션 화보"],
            experience: "4년"
        }
    },
    {
        name: "손예진",
        englishName: "Son Ye-jin",
        gender: "female",
        age: "30대",
        tags: ["로맨틱", "품격있는", "우아한", "감성적"],
        description: "로맨틱하고 품격 있는 매력",
        tier: "premium",
        price: 100,
        image: "https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/actor6.jpg",
        categories: ["뷰티", "웨딩", "럭셔리"],
        portfolio: {
            videos: ["웨딩 광고", "화장품 CF"],
            experience: "7년"
        }
    },
    {
        name: "아이유",
        englishName: "IU",
        gender: "female",
        age: "20대",
        tags: ["사랑스러운", "순수한", "청순한", "매력적인"],
        description: "사랑스럽고 순수한 국민 여동생",
        tier: "vip",
        price: 150,
        image: "https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/actor7.jpg",
        categories: ["음료", "뷰티", "라이프스타일"],
        portfolio: {
            videos: ["음료 광고", "화장품 CF", "브랜드 캠페인"],
            experience: "6년"
        }
    }
];

// Function to add model to Firebase
async function addModelToFirebase(model) {
    try {
        const modelData = {
            // Personal Information
            personalInfo: {
                name: model.name,
                englishName: model.englishName,
                birthYear: model.age === "20대" ? 2000 : model.age === "30대" ? 1990 : 1980,
                gender: model.gender,
                height: model.gender === "female" ? 165 : 180,
                weight: model.gender === "female" ? 50 : 70,
                email: `${model.englishName.toLowerCase().replace(' ', '')}@celebrity.kr`,
                phone: "010-0000-0000",
                location: "서울"
            },
            
            // Professional Information
            professionalInfo: {
                categories: model.categories,
                experience: model.portfolio.experience,
                languages: ["한국어", "영어"],
                skills: model.tags,
                available: true,
                responseTime: "24시간 이내"
            },
            
            // Portfolio
            portfolio: {
                mainImage: model.image,
                additionalImages: [model.image],
                videos: model.portfolio.videos,
                description: model.description
            },
            
            // Pricing
            pricing: {
                tier: model.tier,
                basePrice: model.price,
                currency: "gems"
            },
            
            // Stats
            stats: {
                totalProjects: Math.floor(Math.random() * 50) + 20,
                rating: 4.5 + Math.random() * 0.5,
                reviews: Math.floor(Math.random() * 30) + 10,
                responseRate: 95 + Math.floor(Math.random() * 5)
            },
            
            // Metadata
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            featured: true,
            isCelebrity: true,
            verified: true,
            searchTags: [...model.tags, model.name, model.englishName.toLowerCase()]
        };
        
        // Add to Firebase
        const docRef = await firebase.firestore().collection('models').add(modelData);
        console.log(`✅ Added ${model.name} with ID: ${docRef.id}`);
        
        // Also add to modelProfiles collection for complete integration
        await firebase.firestore().collection('modelProfiles').doc(docRef.id).set({
            modelId: docRef.id,
            displayName: model.name,
            tier: model.tier,
            bio: model.description,
            customPricing: {
                online_basic: {
                    enabled: true,
                    basePrice: model.price * 10000, // Convert to KRW
                    minDuration: "3개월",
                    maxDuration: "12개월"
                },
                online_premium: {
                    enabled: true,
                    basePrice: model.price * 20000,
                    minDuration: "6개월",
                    maxDuration: "24개월"
                }
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return docRef.id;
    } catch (error) {
        console.error(`❌ Error adding ${model.name}:`, error);
        throw error;
    }
}

// Main migration function
async function migrateCelebrities() {
    console.log('🚀 Starting celebrity migration...');
    console.log(`📊 Total celebrities to migrate: ${celebrities.length}`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const celebrity of celebrities) {
        try {
            await addModelToFirebase(celebrity);
            successCount++;
        } catch (error) {
            failCount++;
        }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Total: ${celebrities.length}`);
    
    return { success: successCount, failed: failCount, total: celebrities.length };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { migrateCelebrities, celebrities };
}