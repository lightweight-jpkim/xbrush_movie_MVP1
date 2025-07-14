/**
 * Model Migration Script
 * Updates existing models to the new schema with commercial fields
 */

class ModelMigration {
    constructor() {
        this.adapter = window.modelStorageAdapter || window.modelStorage;
    }
    
    /**
     * Run migration for all models
     */
    async migrateAllModels() {
        console.log('Starting model migration...');
        
        try {
            const models = await this.adapter.getAllModels();
            console.log(`Found ${models.length} models to migrate`);
            
            let successCount = 0;
            let errorCount = 0;
            
            for (const model of models) {
                try {
                    if (this.needsMigration(model)) {
                        console.log(`Migrating model: ${model.id}`);
                        const migratedModel = this.migrateModel(model);
                        await this.adapter.updateModel(model.id, migratedModel);
                        successCount++;
                    } else {
                        console.log(`Model ${model.id} already migrated`);
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Error migrating model ${model.id}:`, error);
                    errorCount++;
                }
            }
            
            console.log(`Migration complete. Success: ${successCount}, Errors: ${errorCount}`);
            return { successCount, errorCount };
            
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }
    
    /**
     * Check if model needs migration
     */
    needsMigration(model) {
        // Check if model has the new structure
        return !model.profile || !model.pricing || !model.availability;
    }
    
    /**
     * Migrate single model to new schema
     */
    migrateModel(model) {
        const migrated = { ...model };
        
        // Ensure basic structure
        migrated.personalInfo = migrated.personalInfo || {
            name: '모델명 없음',
            intro: '',
            description: '',
            categories: []
        };
        
        // Add professional profile if missing
        if (!migrated.profile) {
            migrated.profile = {
                tagline: migrated.personalInfo.intro || '',
                experience: '1-3년',
                location: '서울, 대한민국',
                languages: ['ko'],
                bio: migrated.personalInfo.description || '',
                specialties: migrated.personalInfo.categories || [],
                verificationStatus: {
                    identity: migrated.kyc?.verified || false,
                    premium: false,
                    featured: false
                }
            };
        }
        
        // Add pricing packages if missing
        if (!migrated.pricing) {
            const basePrice = migrated.contract?.basePrice || 50000;
            migrated.pricing = {
                currency: 'KRW',
                packages: [
                    {
                        id: 'basic',
                        name: 'Basic',
                        price: basePrice,
                        description: '기본 촬영 패키지',
                        features: [
                            '2시간 촬영',
                            '편집된 사진 10장',
                            '개인 사용 라이선스'
                        ],
                        deliveryTime: 3,
                        revisions: 1,
                        popular: false
                    },
                    {
                        id: 'standard',
                        name: 'Standard',
                        price: basePrice * 2,
                        description: '표준 촬영 패키지',
                        features: [
                            '4시간 촬영',
                            '편집된 사진 30장',
                            '상업적 사용 라이선스',
                            '헤어/메이크업 포함'
                        ],
                        deliveryTime: 5,
                        revisions: 3,
                        popular: true
                    },
                    {
                        id: 'premium',
                        name: 'Premium',
                        price: basePrice * 4,
                        description: '프리미엄 촬영 패키지',
                        features: [
                            '종일 촬영',
                            '편집된 사진 무제한',
                            '모든 원본 파일 제공',
                            '헤어/메이크업 포함',
                            '무제한 수정'
                        ],
                        deliveryTime: 7,
                        revisions: -1,
                        popular: false
                    }
                ]
            };
        }
        
        // Add availability settings if missing
        if (!migrated.availability) {
            migrated.availability = {
                status: migrated.status === 'active' ? 'available' : 'offline',
                responseTime: 2,
                lastSeen: new Date().toISOString(),
                autoReply: '안녕하세요! 메시지 감사합니다. 곧 연락드리겠습니다.'
            };
        }
        
        // Add stats if missing
        if (!migrated.stats) {
            migrated.stats = {
                completedProjects: 0,
                totalClients: 0,
                repeatClients: 0,
                responseTime: 2,
                joinedDate: migrated.registrationDate || new Date().toISOString()
            };
        }
        
        // Add ratings if missing
        if (!migrated.ratings) {
            migrated.ratings = {
                overall: 0,
                communication: 0,
                quality: 0,
                delivery: 0,
                value: 0,
                count: 0
            };
        }
        
        // Add flags if missing
        if (!migrated.flags) {
            migrated.flags = {
                featured: false,
                verified: migrated.kyc?.verified || false,
                newModel: this.isNewModel(migrated.registrationDate),
                premium: false
            };
        }
        
        // Update portfolio structure if needed
        if (migrated.portfolio && !migrated.portfolio.gallery) {
            migrated.portfolio.gallery = migrated.portfolio.images?.map(img => ({
                id: img.id,
                url: img.url,
                thumbnailUrl: img.url,
                category: 'all',
                caption: img.name || ''
            })) || [];
        }
        
        // Set update timestamp
        migrated.updatedAt = window.firebase ? 
            firebase.firestore.FieldValue.serverTimestamp() : 
            new Date().toISOString();
        
        return migrated;
    }
    
    /**
     * Check if model is new (registered within last 30 days)
     */
    isNewModel(registrationDate) {
        if (!registrationDate) return true;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(registrationDate) > thirtyDaysAgo;
    }
    
    /**
     * Run migration with UI feedback
     */
    async runMigrationWithUI() {
        const confirmMigration = confirm(
            '기존 모델 데이터를 새로운 스키마로 마이그레이션하시겠습니까?\n\n' +
            '이 작업은 모든 모델에 다음을 추가합니다:\n' +
            '- 전문 프로필 정보\n' +
            '- 가격 패키지\n' +
            '- 예약 가능 설정\n' +
            '- 통계 및 평점\n\n' +
            '계속하시겠습니까?'
        );
        
        if (!confirmMigration) return;
        
        try {
            // Show loading indicator
            if (window.showToast) {
                window.showToast('마이그레이션을 시작합니다...', 'info');
            }
            
            const result = await this.migrateAllModels();
            
            if (window.showToast) {
                if (result.errorCount === 0) {
                    window.showToast(
                        `마이그레이션 완료! ${result.successCount}개 모델이 업데이트되었습니다.`,
                        'success'
                    );
                } else {
                    window.showToast(
                        `마이그레이션 완료. 성공: ${result.successCount}, 실패: ${result.errorCount}`,
                        'warning'
                    );
                }
            }
            
            // Reload page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Migration error:', error);
            if (window.showToast) {
                window.showToast('마이그레이션 중 오류가 발생했습니다.', 'error');
            }
        }
    }
}

// Create global instance
window.modelMigration = new ModelMigration();

// Add migration button to admin page if needed
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Add migration button to admin actions
        const adminActions = document.querySelector('.admin-actions');
        if (adminActions && !document.getElementById('migrationBtn')) {
            const migrationBtn = document.createElement('button');
            migrationBtn.id = 'migrationBtn';
            migrationBtn.className = 'btn btn-outline';
            migrationBtn.innerHTML = '🔄 데이터 마이그레이션';
            migrationBtn.onclick = () => window.modelMigration.runMigrationWithUI();
            adminActions.insertBefore(migrationBtn, adminActions.firstChild);
        }
    });
}