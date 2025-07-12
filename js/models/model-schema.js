/**
 * Enhanced Model Schema for Commercial Marketplace
 * Defines the structure for professional model profiles
 */

class ModelSchema {
    /**
     * Create a new model profile with enhanced commercial features
     */
    static createModel(basicInfo = {}) {
        return {
            // System fields
            id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'pending', // pending, active, inactive, suspended
            
            // Basic Information (from registration)
            personalInfo: {
                name: basicInfo.name || '',
                email: basicInfo.email || '',
                phone: basicInfo.phone || '',
                ...basicInfo.personalInfo
            },
            
            // Professional Profile
            profile: {
                displayName: basicInfo.name || '', // Public display name
                tagline: '', // "전문 패션 모델 | 10년 경력"
                bio: '', // Detailed introduction (up to 1000 chars)
                specialties: [], // ["fashion", "beauty", "lifestyle", "food", "tech"]
                languages: ['ko'], // ["ko", "en", "ja", "zh"]
                experience: '', // "5-10 years"
                location: '', // "Seoul, South Korea"
                verificationStatus: {
                    identity: false, // KYC verified
                    professional: false, // Portfolio verified
                    premium: false, // Premium member
                    verifiedDate: null
                }
            },
            
            // Enhanced Portfolio & Media
            portfolio: {
                thumbnailUrl: basicInfo.thumbnailUrl || '',
                coverImageUrl: '', // Hero banner image (1920x480)
                profileVideoUrl: '', // Introduction video (max 60s)
                gallery: [], // Array of media items
                showcaseProjects: [], // Featured commercial works
                styleImages: [], // AI style reference images
                certificates: [] // Professional certificates
            },
            
            // Pricing & Service Packages
            pricing: {
                currency: 'KRW',
                basePrice: 100000, // Starting price
                packages: [
                    {
                        id: 'basic',
                        name: '베이직',
                        price: 100000,
                        description: '기본 AI 모델 생성 (10장)',
                        deliveryTime: 1, // days
                        revisions: 1,
                        features: [
                            '고품질 AI 이미지 10장',
                            '기본 후처리',
                            '1회 수정',
                            '상업적 사용 가능'
                        ],
                        popular: false
                    },
                    {
                        id: 'standard',
                        name: '스탠다드',
                        price: 200000,
                        description: '프로 AI 모델 생성 (30장)',
                        deliveryTime: 2,
                        revisions: 3,
                        features: [
                            '고품질 AI 이미지 30장',
                            '고급 후처리',
                            '3회 수정',
                            '다양한 스타일 적용',
                            '소스 파일 제공'
                        ],
                        popular: true
                    },
                    {
                        id: 'premium',
                        name: '프리미엄',
                        price: 500000,
                        description: '맞춤형 AI 모델 패키지',
                        deliveryTime: 5,
                        revisions: -1, // unlimited
                        features: [
                            '무제한 AI 이미지',
                            '맞춤형 스타일 개발',
                            '무제한 수정',
                            '독점 사용권 옵션',
                            '브랜드 콜라보레이션'
                        ],
                        popular: false
                    }
                ],
                customQuote: true,
                addons: [
                    {
                        id: 'rush',
                        name: '긴급 처리',
                        price: 50000,
                        description: '24시간 내 완료'
                    },
                    {
                        id: 'extra-images',
                        name: '추가 이미지',
                        price: 5000,
                        description: '이미지당 추가 비용'
                    }
                ]
            },
            
            // Statistics & Performance
            stats: {
                completedProjects: 0,
                activeProjects: 0,
                totalClients: 0,
                repeatClients: 0,
                responseTime: 2, // average hours
                onTimeDelivery: 100, // percentage
                totalEarnings: 0,
                monthlyEarnings: 0,
                joinedDate: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                profileViews: 0,
                inquiries: 0,
                conversionRate: 0 // inquiries to projects
            },
            
            // Ratings & Reviews Summary
            ratings: {
                overall: 0,
                communication: 0,
                quality: 0,
                delivery: 0,
                value: 0,
                professionalism: 0,
                totalReviews: 0,
                distribution: { // Review count by rating
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0
                }
            },
            
            // Availability & Schedule
            availability: {
                status: 'available', // available, busy, vacation, custom
                statusMessage: '', // Custom status message
                nextAvailable: null,
                workingHours: {
                    timezone: 'Asia/Seoul',
                    days: {
                        mon: { active: true, start: '09:00', end: '18:00' },
                        tue: { active: true, start: '09:00', end: '18:00' },
                        wed: { active: true, start: '09:00', end: '18:00' },
                        thu: { active: true, start: '09:00', end: '18:00' },
                        fri: { active: true, start: '09:00', end: '18:00' },
                        sat: { active: false },
                        sun: { active: false }
                    }
                },
                vacationMode: false,
                vacationMessage: '',
                bookedDates: [] // Array of booked date ranges
            },
            
            // Commercial Terms & Policies
            commercialTerms: {
                usageRights: {
                    basic: ['commercial', 'sns', 'web'],
                    extended: ['broadcast', 'print'],
                    exclusive: false
                },
                restrictions: [
                    '성인 콘텐츠 불가',
                    '정치적 콘텐츠 제한'
                ],
                licenseType: 'standard', // standard, extended, exclusive
                licenseDuration: 12, // months
                extraFees: {
                    rushDelivery: true,
                    exclusiveRights: true,
                    perpetualLicense: true
                },
                cancellationPolicy: '프로젝트 시작 전 100% 환불, 시작 후 50% 환불',
                termsAccepted: true
            },
            
            // SEO & Discovery
            seo: {
                metaTitle: '',
                metaDescription: '',
                keywords: [],
                slug: '' // URL-friendly name
            },
            
            // Internal flags
            flags: {
                featured: false,
                trending: false,
                newModel: true,
                verified: false,
                premium: false,
                suspended: false
            }
        };
    }
    
    /**
     * Create a gallery item
     */
    static createGalleryItem(file, metadata = {}) {
        return {
            id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url: file.url || '',
            thumbnailUrl: file.thumbnailUrl || file.url || '',
            type: file.type || 'image', // image, video
            mimeType: file.mimeType || 'image/jpeg',
            size: file.size || 0,
            dimensions: {
                width: metadata.width || 0,
                height: metadata.height || 0
            },
            caption: metadata.caption || '',
            tags: metadata.tags || [],
            category: metadata.category || 'portfolio', // portfolio, reference, certificate
            uploadedAt: new Date().toISOString(),
            order: metadata.order || 0
        };
    }
    
    /**
     * Create a showcase project
     */
    static createShowcaseProject(projectData = {}) {
        return {
            id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: projectData.title || '',
            client: projectData.client || '',
            category: projectData.category || '',
            description: projectData.description || '',
            images: projectData.images || [],
            videoUrl: projectData.videoUrl || '',
            completedAt: projectData.completedAt || new Date().toISOString(),
            featured: projectData.featured || false,
            tags: projectData.tags || []
        };
    }
    
    /**
     * Validate model data
     */
    static validateModel(modelData) {
        const errors = [];
        
        // Required fields
        if (!modelData.personalInfo?.name) {
            errors.push('Model name is required');
        }
        
        if (!modelData.profile?.tagline) {
            errors.push('Professional tagline is required');
        }
        
        if (!modelData.portfolio?.thumbnailUrl) {
            errors.push('Profile thumbnail is required');
        }
        
        if (!modelData.pricing?.packages?.length) {
            errors.push('At least one pricing package is required');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Migrate old model data to new schema
     */
    static migrateFromOldSchema(oldModel) {
        const newModel = this.createModel();
        
        // Map old fields to new structure
        if (oldModel.personalInfo) {
            newModel.personalInfo = { ...oldModel.personalInfo };
            newModel.profile.displayName = oldModel.personalInfo.name || '';
        }
        
        if (oldModel.portfolio) {
            newModel.portfolio.thumbnailUrl = oldModel.portfolio.thumbnailUrl || '';
            if (oldModel.portfolio.images) {
                newModel.portfolio.gallery = oldModel.portfolio.images.map((img, idx) => 
                    this.createGalleryItem({ url: img.url || img }, { order: idx })
                );
            }
        }
        
        if (oldModel.contract) {
            newModel.pricing.basePrice = oldModel.contract.basePrice || 100000;
            if (oldModel.contract.usageRights) {
                newModel.commercialTerms.usageRights.basic = oldModel.contract.usageRights;
            }
        }
        
        // Preserve system fields
        newModel.id = oldModel.id;
        newModel.status = oldModel.status || 'active';
        newModel.createdAt = oldModel.registrationDate || oldModel.createdAt || new Date().toISOString();
        
        return newModel;
    }
}

// Export for use in other files
window.ModelSchema = ModelSchema;