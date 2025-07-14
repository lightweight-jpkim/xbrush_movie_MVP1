// Complete Database Initialization Script
// Creates all 7 tables with sample data for the face licensing platform

// Sample celebrity data
const celebrities = [
    { id: 'celeb_chaeyeon', name: '채연', englishName: 'Chaeyeon' },
    { id: 'celeb_leesangah', name: '이상아', englishName: 'Lee Sang-ah' },
    { id: 'celeb_leejungjae', name: '이정재', englishName: 'Lee Jung-jae' },
    { id: 'celeb_junjihyun', name: '전지현', englishName: 'Jun Ji-hyun' },
    { id: 'celeb_parkseojun', name: '박서준', englishName: 'Park Seo-jun' },
    { id: 'celeb_sonyejin', name: '손예진', englishName: 'Son Ye-jin' },
    { id: 'celeb_iu', name: '아이유', englishName: 'IU' }
];

// Sample regular models
const regularModels = [
    { id: 'model_001', name: '김민지', englishName: 'Kim Min-ji' },
    { id: 'model_002', name: '박준호', englishName: 'Park Jun-ho' },
    { id: 'model_003', name: '이수연', englishName: 'Lee Soo-yeon' }
];

class DatabaseInitializer {
    constructor() {
        this.db = null;
        this.batch = null;
        this.modelIds = [];
        this.licensingPlanIds = [];
    }

    async initialize() {
        console.log('🚀 Starting complete database initialization...');
        
        try {
            // Wait for Firebase
            await this.waitForFirebase();
            this.db = firebase.firestore();
            
            // Clear existing data if requested
            const clearData = confirm('Clear existing data before initialization? (Recommended for clean setup)');
            if (clearData) {
                await this.clearExistingData();
            }
            
            // Initialize all tables
            console.log('📊 Creating 7-table structure...');
            
            // 1. Models table
            await this.createModelsTable();
            
            // 2. Model Profiles table
            await this.createModelProfilesTable();
            
            // 3. Licensing Plans table
            await this.createLicensingPlansTable();
            
            // 4. Licenses table (actual purchases)
            await this.createLicensesTable();
            
            // 5. Projects table
            await this.createProjectsTable();
            
            // 6. Reviews table
            await this.createReviewsTable();
            
            // 7. Payments table
            await this.createPaymentsTable();
            
            console.log('✅ Database initialization complete!');
            return { success: true, message: 'All tables created successfully' };
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    async waitForFirebase() {
        let retries = 20;
        while (retries > 0 && !window.firebase?.firestore) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries--;
        }
        if (!window.firebase?.firestore) {
            throw new Error('Firebase not initialized');
        }
    }

    async clearExistingData() {
        console.log('🗑️ Clearing existing data...');
        const collections = ['models', 'modelProfiles', 'licensingPlans', 'licenses', 'projects', 'reviews', 'payments'];
        
        for (const collection of collections) {
            const snapshot = await this.db.collection(collection).limit(100).get();
            const batch = this.db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    }

    // 1. MODELS TABLE - Basic model information
    async createModelsTable() {
        console.log('📌 Creating models table...');
        
        // Add celebrities
        for (const celeb of celebrities) {
            const modelData = {
                // Personal Information
                personalInfo: {
                    name: celeb.name,
                    englishName: celeb.englishName,
                    birthYear: 1990,
                    gender: ['채연', '이상아', '전지현', '손예진', '아이유'].includes(celeb.name) ? 'female' : 'male',
                    height: 170,
                    weight: 60,
                    email: `${celeb.englishName.toLowerCase().replace(' ', '')}@celebrity.kr`,
                    phone: '010-0000-0000',
                    location: '서울'
                },
                
                // Professional Information
                professionalInfo: {
                    categories: ['광고', '방송', 'SNS'],
                    experience: '5년 이상',
                    languages: ['한국어', '영어'],
                    skills: ['연기', '모델링', '광고촬영'],
                    available: true,
                    responseTime: '24시간 이내'
                },
                
                // Portfolio
                portfolio: {
                    mainImage: `https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/${celeb.id}.jpg`,
                    additionalImages: [],
                    videos: ['샘플 광고 1', '샘플 광고 2'],
                    description: `${celeb.name}의 프로페셔널 포트폴리오`
                },
                
                // Pricing
                pricing: {
                    tier: celeb.name === '아이유' ? 'vip' : 'premium',
                    basePrice: celeb.name === '아이유' ? 150 : 100,
                    currency: 'gems'
                },
                
                // Stats
                stats: {
                    totalProjects: Math.floor(Math.random() * 100) + 50,
                    rating: 4.5 + Math.random() * 0.5,
                    reviews: Math.floor(Math.random() * 50) + 20,
                    responseRate: 98
                },
                
                // Metadata
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                featured: true,
                isCelebrity: true,
                verified: true,
                status: 'active',
                searchTags: [celeb.name, celeb.englishName.toLowerCase(), '연예인', 'celebrity']
            };
            
            const docRef = await this.db.collection('models').doc(celeb.id).set(modelData);
            this.modelIds.push(celeb.id);
            console.log(`✅ Added celebrity: ${celeb.name}`);
        }
        
        // Add regular models
        for (const model of regularModels) {
            const modelData = {
                personalInfo: {
                    name: model.name,
                    englishName: model.englishName,
                    birthYear: 1995,
                    gender: model.name.includes('민지') || model.name.includes('수연') ? 'female' : 'male',
                    height: 165,
                    weight: 55,
                    email: `${model.englishName.toLowerCase().replace(' ', '')}@model.kr`,
                    phone: '010-1111-2222',
                    location: '서울'
                },
                
                professionalInfo: {
                    categories: ['광고', 'SNS'],
                    experience: '2년',
                    languages: ['한국어'],
                    skills: ['모델링', '광고촬영'],
                    available: true,
                    responseTime: '48시간 이내'
                },
                
                portfolio: {
                    mainImage: `https://via.placeholder.com/300x400?text=${model.name}`,
                    additionalImages: [],
                    videos: [],
                    description: `${model.name}의 포트폴리오`
                },
                
                pricing: {
                    tier: 'basic',
                    basePrice: 50,
                    currency: 'gems'
                },
                
                stats: {
                    totalProjects: Math.floor(Math.random() * 20) + 5,
                    rating: 4.0 + Math.random() * 0.5,
                    reviews: Math.floor(Math.random() * 10) + 2,
                    responseRate: 90
                },
                
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                featured: false,
                isCelebrity: false,
                verified: true,
                status: 'active',
                searchTags: [model.name, model.englishName.toLowerCase(), '모델']
            };
            
            await this.db.collection('models').doc(model.id).set(modelData);
            this.modelIds.push(model.id);
            console.log(`✅ Added model: ${model.name}`);
        }
    }

    // 2. MODEL PROFILES TABLE - Extended profile information
    async createModelProfilesTable() {
        console.log('📌 Creating modelProfiles table...');
        
        for (const modelId of this.modelIds) {
            const model = await this.db.collection('models').doc(modelId).get();
            const modelData = model.data();
            
            const profileData = {
                modelId: modelId,
                displayName: modelData.personalInfo.name,
                bio: `안녕하세요, ${modelData.personalInfo.name}입니다. 전문적인 광고 모델로 활동하고 있습니다.`,
                
                // Social Media
                socialMedia: {
                    instagram: `@${modelData.personalInfo.englishName.toLowerCase().replace(' ', '')}`,
                    youtube: '',
                    tiktok: ''
                },
                
                // Achievements
                achievements: [
                    '2023년 베스트 모델상',
                    '광고 촬영 100회 달성',
                    '고객 만족도 95% 이상'
                ],
                
                // Preferences
                preferences: {
                    workingHours: '09:00-18:00',
                    preferredCategories: modelData.professionalInfo.categories,
                    blacklistCategories: ['주류', '담배'],
                    minimumProjectDuration: '1개월'
                },
                
                // Bank Information (encrypted in real app)
                bankInfo: {
                    bankName: '신한은행',
                    accountHolder: modelData.personalInfo.name,
                    accountNumber: '***-***-******' // Masked for security
                },
                
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection('modelProfiles').doc(modelId).set(profileData);
            console.log(`✅ Created profile for: ${modelData.personalInfo.name}`);
        }
    }

    // 3. LICENSING PLANS TABLE - Available licensing options
    async createLicensingPlansTable() {
        console.log('📌 Creating licensingPlans table...');
        
        const planTypes = [
            {
                id: 'online_basic',
                name: '온라인 베이직',
                description: 'SNS 및 웹사이트 광고에 적합',
                scope: 'SNS, 웹사이트',
                defaultDuration: '6개월',
                defaultTerritory: '국내'
            },
            {
                id: 'online_premium',
                name: '온라인 프리미엄',
                description: '모든 온라인 채널 사용 가능',
                scope: '모든 온라인 채널',
                defaultDuration: '12개월',
                defaultTerritory: '전세계'
            },
            {
                id: 'broadcast',
                name: '방송 광고',
                description: 'TV 및 케이블 방송용',
                scope: 'TV, 케이블',
                defaultDuration: '3개월',
                defaultTerritory: '국내'
            }
        ];
        
        // Create plans for each model
        for (const modelId of this.modelIds) {
            const model = await this.db.collection('models').doc(modelId).get();
            const modelData = model.data();
            const isCelebrity = modelData.isCelebrity;
            
            for (const planType of planTypes) {
                const planId = `${modelId}_${planType.id}`;
                
                const planData = {
                    planId: planId,
                    modelId: modelId,
                    planType: planType.id,
                    
                    // Basic Settings
                    settings: {
                        enabled: true,
                        displayOrder: planTypes.indexOf(planType) + 1,
                        customName: `${modelData.personalInfo.name}의 ${planType.name}`,
                        customDescription: planType.description
                    },
                    
                    // Pricing Configuration
                    pricing: {
                        basePrice: isCelebrity ? 
                            (planType.id === 'online_basic' ? 3000000 : 
                             planType.id === 'online_premium' ? 5000000 : 10000000) :
                            (planType.id === 'online_basic' ? 300000 : 
                             planType.id === 'online_premium' ? 500000 : 1000000),
                        currency: 'KRW',
                        validFrom: new Date().toISOString(),
                        validUntil: null,
                        promotionalPrice: null,
                        promotionEnds: null
                    },
                    
                    // Customizable Options
                    options: {
                        duration: {
                            min: 3,
                            max: 24,
                            default: parseInt(planType.defaultDuration),
                            unit: 'months'
                        },
                        territory: {
                            available: ['domestic', 'asia', 'global'],
                            default: 'domestic',
                            pricing: {
                                'domestic': 1.0,
                                'asia': 1.3,
                                'global': 1.5
                            }
                        },
                        usage: {
                            channels: planType.scope.split(', '),
                            restrictions: '성인물, 정치광고 제외'
                        },
                        delivery: {
                            standard: 5,
                            express: 3,
                            rush: 1
                        },
                        revisions: {
                            included: 2,
                            additional: 50000
                        }
                    },
                    
                    // Dynamic Pricing Rules
                    dynamicPricing: {
                        rushDelivery: {
                            enabled: true,
                            multipliers: {
                                '24h': 2.0,
                                '48h': 1.5,
                                '72h': 1.2
                            }
                        },
                        bulkDiscount: {
                            enabled: true,
                            tiers: [
                                { min: 3, discount: 0.1 },
                                { min: 5, discount: 0.15 },
                                { min: 10, discount: 0.2 }
                            ]
                        }
                    },
                    
                    // Approval Status
                    approval: {
                        status: 'approved',
                        reviewedBy: 'admin_system',
                        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        reviewNotes: 'Auto-approved during initialization'
                    },
                    
                    // Performance Metrics
                    metrics: {
                        views: Math.floor(Math.random() * 1000),
                        inquiries: Math.floor(Math.random() * 100),
                        purchases: Math.floor(Math.random() * 50),
                        conversionRate: 0.05 + Math.random() * 0.1,
                        avgRating: 4.0 + Math.random() * 1.0,
                        revenue: 0
                    },
                    
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isActive: true,
                    isDeleted: false
                };
                
                await this.db.collection('licensingPlans').doc(planId).set(planData);
                this.licensingPlanIds.push(planId);
            }
            
            console.log(`✅ Created licensing plans for: ${modelData.personalInfo.name}`);
        }
    }

    // 4. LICENSES TABLE - Actual purchased licenses
    async createLicensesTable() {
        console.log('📌 Creating licenses table...');
        
        // Create sample licenses
        const sampleLicenses = [
            {
                licenseId: 'lic_001',
                projectId: 'proj_001',
                modelId: 'celeb_iu',
                customerId: 'cust_001',
                licensingPlanId: 'celeb_iu_online_premium',
                
                // License Details
                details: {
                    type: 'online_premium',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                    territory: 'domestic',
                    usage: ['웹사이트', 'SNS', '유튜브'],
                    restrictions: ['성인물 제외', '정치광고 제외']
                },
                
                // Pricing
                pricing: {
                    basePrice: 5000000,
                    territoryCost: 0,
                    rushDeliveryCost: 0,
                    bulkDiscount: 0,
                    finalPrice: 5000000,
                    currency: 'KRW',
                    paymentMethod: 'card'
                },
                
                // Contract
                contract: {
                    contractUrl: '/contracts/lic_001.pdf',
                    signedDate: new Date().toISOString(),
                    signedBy: {
                        customer: 'cust_001',
                        model: 'celeb_iu',
                        platform: 'xBrush'
                    }
                },
                
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const license of sampleLicenses) {
            await this.db.collection('licenses').doc(license.licenseId).set(license);
            console.log(`✅ Created license: ${license.licenseId}`);
        }
    }

    // 5. PROJECTS TABLE - Customer projects using licenses
    async createProjectsTable() {
        console.log('📌 Creating projects table...');
        
        const sampleProjects = [
            {
                projectId: 'proj_001',
                customerId: 'cust_001',
                
                // Project Information
                projectInfo: {
                    name: '2024 봄 신제품 광고 캠페인',
                    description: '새로운 화장품 라인 런칭 광고',
                    category: '뷰티',
                    type: 'commercial',
                    brand: 'BeautyBrand'
                },
                
                // Associated Licenses
                licenses: ['lic_001'],
                models: ['celeb_iu'],
                
                // Project Timeline
                timeline: {
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
                    shootingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
                },
                
                // Deliverables
                deliverables: {
                    videos: [
                        { name: 'Main TVC 30s', status: 'completed', url: '/videos/proj_001_main.mp4' },
                        { name: 'SNS Cut 15s', status: 'in_progress', url: null }
                    ],
                    images: [
                        { name: 'Key Visual', status: 'completed', url: '/images/proj_001_kv.jpg' }
                    ]
                },
                
                // Budget
                budget: {
                    total: 10000000,
                    spent: 5000000,
                    currency: 'KRW'
                },
                
                status: 'in_progress',
                visibility: 'private',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const project of sampleProjects) {
            await this.db.collection('projects').doc(project.projectId).set(project);
            console.log(`✅ Created project: ${project.projectInfo.name}`);
        }
    }

    // 6. REVIEWS TABLE - Customer reviews for models
    async createReviewsTable() {
        console.log('📌 Creating reviews table...');
        
        const sampleReviews = [
            {
                reviewId: 'review_001',
                modelId: 'celeb_iu',
                customerId: 'cust_001',
                projectId: 'proj_001',
                licenseId: 'lic_001',
                
                // Review Content
                rating: 5,
                title: '완벽한 광고 촬영이었습니다',
                content: '아이유님의 프로페셔널한 태도와 뛰어난 표현력 덕분에 최고의 광고를 만들 수 있었습니다.',
                
                // Detailed Ratings
                detailedRatings: {
                    professionalism: 5,
                    communication: 5,
                    creativity: 5,
                    punctuality: 5,
                    overall: 5
                },
                
                // Review Metadata
                helpful: 42,
                notHelpful: 2,
                verified: true,
                featured: true,
                
                // Response from Model
                modelResponse: {
                    content: '좋은 평가 감사합니다. 함께 작업할 수 있어서 즐거웠습니다!',
                    date: new Date().toISOString()
                },
                
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const review of sampleReviews) {
            await this.db.collection('reviews').doc(review.reviewId).set(review);
            console.log(`✅ Created review: ${review.reviewId}`);
        }
    }

    // 7. PAYMENTS TABLE - Payment transactions
    async createPaymentsTable() {
        console.log('📌 Creating payments table...');
        
        const samplePayments = [
            {
                paymentId: 'pay_001',
                licenseId: 'lic_001',
                customerId: 'cust_001',
                modelId: 'celeb_iu',
                
                // Payment Details
                amount: 5000000,
                currency: 'KRW',
                method: 'card',
                
                // Card Information (tokenized in real app)
                cardInfo: {
                    last4: '1234',
                    brand: 'visa',
                    expMonth: 12,
                    expYear: 2025
                },
                
                // Transaction Details
                transaction: {
                    status: 'completed',
                    transactionId: 'txn_abc123',
                    gateway: 'stripe',
                    receiptUrl: '/receipts/pay_001.pdf'
                },
                
                // Platform Fees
                breakdown: {
                    subtotal: 5000000,
                    platformFee: 500000, // 10%
                    modelPayout: 4500000,
                    tax: 0
                },
                
                // Payout Information
                payout: {
                    status: 'scheduled',
                    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
                    method: 'bank_transfer'
                },
                
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const payment of samplePayments) {
            await this.db.collection('payments').doc(payment.paymentId).set(payment);
            console.log(`✅ Created payment: ${payment.paymentId}`);
        }
    }
}