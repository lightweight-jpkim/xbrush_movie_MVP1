/**
 * Model Display Component
 * Handles rendering model cards and showcase on main page
 */

class ModelDisplay {
    constructor() {
        this.modelsContainer = null;
        this.currentFilter = 'all';
        this.currentSort = 'newest';
    }

    /**
     * Initialize the model display
     */
    init(containerId) {
        this.modelsContainer = document.getElementById(containerId);
        if (!this.modelsContainer) {
            console.error('Models container not found:', containerId);
            return;
        }

        this.loadAndDisplayModels();
        this.setupEventListeners();
        this.setupRealtimeUpdates();
    }

    /**
     * Load and display models
     */
    async loadAndDisplayModels() {
        if (!window.modelStorage) {
            console.error('ModelStorage not initialized');
            this.modelsContainer.innerHTML = '<div class="error-state">저장소가 초기화되지 않았습니다. 페이지를 새로고침해주세요.</div>';
            return;
        }

        try {
            // Show loading state
            this.modelsContainer.innerHTML = '<div class="loading-state">모델을 불러오는 중...</div>';
            
            // Wait a bit for Firebase to initialize if needed
            if (!window.firebaseDB) {
                console.log('Waiting for Firebase initialization...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Get active models (now async)
            const models = await window.modelStorage.getActiveModels();
            
            if (models.length === 0) {
                this.displayEmptyState();
                return;
            }

            // Sort models
            const sortedModels = this.sortModels(models, this.currentSort);
            
            // Filter models
            const filteredModels = this.filterModels(sortedModels, this.currentFilter);
            
            // Display models
            this.displayModels(filteredModels);
        } catch (error) {
            console.error('Error loading models:', error);
            console.error('Error details:', error.message);
            console.error('Firebase status:', window.firebaseDB ? 'initialized' : 'not initialized');
            this.modelsContainer.innerHTML = `<div class="error-state">
                모델을 불러오는 중 오류가 발생했습니다.<br>
                <small>${error.message}</small><br>
                <button onclick="window.modelDisplay.loadAndDisplayModels()" style="margin-top: 10px;">다시 시도</button>
            </div>`;
        }
    }

    /**
     * Display empty state
     */
    displayEmptyState() {
        this.modelsContainer.innerHTML = `
            <div class="empty-models-state">
                <div class="empty-icon">👥</div>
                <h3>아직 등록된 모델이 없습니다</h3>
                <p>첫 번째 AI 모델이 되어보세요!</p>
                <a href="model-register.html" class="btn btn-primary">모델 등록하기</a>
            </div>
        `;
    }

    /**
     * Display models grid
     */
    displayModels(models) {
        const modelsHTML = models.map(model => this.createModelCard(model)).join('');
        
        this.modelsContainer.innerHTML = `
            <div class="models-grid">
                ${modelsHTML}
            </div>
        `;

        // Add click handlers
        this.attachCardClickHandlers();
    }

    /**
     * Create model card HTML
     */
    createModelCard(model) {
        const {
            id,
            personalInfo = {},
            profile = {},
            portfolio = {},
            pricing = {},
            ratings = {},
            stats = {},
            availability = {},
            flags = {}
        } = model;

        // Extract data with enhanced schema support
        const name = personalInfo.name || profile?.displayName || '이름 없음';
        const tagline = profile?.tagline || personalInfo.intro || '프로페셔널 AI 모델';
        const specialties = profile?.specialties || personalInfo.categories || [];
        const thumbnail = portfolio?.thumbnailUrl || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop';
        const basePrice = pricing?.basePrice || pricing?.packages?.[0]?.price || 100000;
        const rating = ratings?.overall || 0;
        const reviewCount = ratings?.totalReviews || 0;
        const completedProjects = stats?.completedProjects || 0;
        const responseTime = stats?.responseTime || 2;
        const isAvailable = availability?.status === 'available';
        const isVerified = profile?.verificationStatus?.identity || false;
        const isPremium = profile?.verificationStatus?.premium || false;
        const isNew = flags?.newModel || false;

        // Format categories/specialties
        const specialtyTags = specialties.slice(0, 3).map(spec => {
            const specMap = {
                'fashion': '패션',
                'beauty': '뷰티',
                'lifestyle': '라이프스타일',
                'food': '푸드',
                'tech': '테크'
            };
            return `<span class="specialty-tag">${specMap[spec] || spec}</span>`;
        }).join('');

        // Trust badges
        const trustBadges = [];
        if (isVerified) trustBadges.push('<span class="trust-badge verified">✓ 인증</span>');
        if (isPremium) trustBadges.push('<span class="trust-badge pro">PRO</span>');
        if (rating >= 4.8 && reviewCount >= 10) trustBadges.push('<span class="trust-badge top-rated">⭐ 우수</span>');
        
        const trustBadgesHTML = trustBadges.length > 0 ? 
            `<div class="model-trust-badges">${trustBadges.join('')}</div>` : '';

        // Status badge
        const statusClass = isAvailable ? '' : 'busy';
        const availabilityText = isAvailable ? '즉시 가능' : '예약 중';

        // Format price
        const formattedPrice = new Intl.NumberFormat('ko-KR').format(basePrice);

        return `
            <div class="model-card model-card-commercial" data-model-id="${id}">
                <div class="model-card-image">
                    ${trustBadgesHTML}
                    <div class="model-status-badge ${statusClass}"></div>
                    <img src="${thumbnail}" alt="${name}" loading="lazy">
                    <div class="model-card-overlay">
                        <button class="view-profile-btn">프로필 보기</button>
                    </div>
                    <div class="model-quick-stats">
                        <div class="quick-stat">
                            <span>📷</span>
                            <span>${completedProjects}개 완료</span>
                        </div>
                        <div class="quick-stat">
                            <span>⏱️</span>
                            <span>${responseTime}시간 응답</span>
                        </div>
                        <div class="quick-stat">
                            <span>⭐</span>
                            <span>${rating.toFixed(1)}점</span>
                        </div>
                    </div>
                </div>
                <div class="model-card-content model-card-content-enhanced">
                    <div class="model-meta-row">
                        <h3 class="model-name">${name}</h3>
                        <span class="model-availability ${statusClass}">${availabilityText}</span>
                    </div>
                    <p class="model-intro">${tagline}</p>
                    <div class="model-specialties">
                        ${specialtyTags}
                    </div>
                    <div class="model-card-footer">
                        <div class="model-price-enhanced">
                            <span class="price-currency">₩</span>
                            <span class="price-amount">${formattedPrice}</span>
                            <span class="price-period">부터</span>
                        </div>
                        <div class="model-rating-enhanced">
                            <span class="rating-score">${rating.toFixed(1)}</span>
                            <span class="rating-stars">★</span>
                            <span class="rating-reviews">(${reviewCount})</span>
                        </div>
                    </div>
                    <div class="model-card-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); window.modelDetailModal.handleSave('${id}')">
                            <span>♡</span>
                            <span>저장</span>
                        </button>
                        <button class="action-btn primary" onclick="event.stopPropagation(); window.modelDetailModal.open('${id}')">
                            <span>👁️</span>
                            <span>상세보기</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Sort models
     */
    sortModels(models, sortBy) {
        const sortedModels = [...models];
        
        switch (sortBy) {
            case 'newest':
                return sortedModels.sort((a, b) => 
                    new Date(b.registrationDate) - new Date(a.registrationDate)
                );
            case 'oldest':
                return sortedModels.sort((a, b) => 
                    new Date(a.registrationDate) - new Date(b.registrationDate)
                );
            case 'priceHigh':
                return sortedModels.sort((a, b) => {
                    const priceA = a.pricing?.packages?.find(p => p.id === 'standard')?.price || a.contract?.basePrice || 0;
                    const priceB = b.pricing?.packages?.find(p => p.id === 'standard')?.price || b.contract?.basePrice || 0;
                    return priceB - priceA;
                });
            case 'priceLow':
                return sortedModels.sort((a, b) => {
                    const priceA = a.pricing?.packages?.find(p => p.id === 'standard')?.price || a.contract?.basePrice || 0;
                    const priceB = b.pricing?.packages?.find(p => p.id === 'standard')?.price || b.contract?.basePrice || 0;
                    return priceA - priceB;
                });
            default:
                return sortedModels;
        }
    }

    /**
     * Filter models
     */
    filterModels(models, filter) {
        if (filter === 'all') {
            return models;
        }
        
        return models.filter(model => {
            const categories = model.personalInfo?.categories || [];
            return categories.includes(filter);
        });
    }

    /**
     * Attach click handlers to model cards
     */
    attachCardClickHandlers() {
        const cards = this.modelsContainer.querySelectorAll('.model-card');
        
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger on button clicks
                if (e.target.closest('.view-profile-btn')) {
                    e.preventDefault();
                    const modelId = card.getAttribute('data-model-id');
                    this.viewModelProfile(modelId);
                } else {
                    const modelId = card.getAttribute('data-model-id');
                    this.viewModelProfile(modelId);
                }
            });
        });
    }

    /**
     * View model profile
     */
    viewModelProfile(modelId) {
        console.log('View profile for model:', modelId);
        
        // Store selected model ID
        sessionStorage.setItem('selectedModelId', modelId);
        
        // Open model detail modal
        if (window.modelDetailModal) {
            window.modelDetailModal.open(modelId);
        } else {
            // Fallback if modal not loaded
            if (window.showToast) {
                window.showToast('프로필을 불러오는 중입니다...', 'info');
            }
        }
    }

    /**
     * Setup event listeners for filters and sorting
     */
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.currentFilter = filter;
                
                // Update active state
                document.querySelectorAll('[data-filter]').forEach(btn => 
                    btn.classList.remove('active')
                );
                e.target.classList.add('active');
                
                this.loadAndDisplayModels();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('modelSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.loadAndDisplayModels();
            });
        }
    }

    /**
     * Setup real-time updates from Firebase
     */
    setupRealtimeUpdates() {
        if (!window.firebaseModelStorage) {
            console.log('Firebase not available for real-time updates');
            return;
        }

        // Subscribe to model changes
        const unsubscribe = window.firebaseModelStorage.subscribeToModels((models) => {
            console.log('Real-time update: Models changed', models.length);
            
            // Filter only active models
            const activeModels = models.filter(model => model.status === 'active');
            
            if (activeModels.length === 0) {
                this.displayEmptyState();
                return;
            }

            // Sort and display models
            const sortedModels = this.sortModels(activeModels, this.currentSort);
            this.displayModels(sortedModels);
        });

        // Store unsubscribe function for cleanup if needed
        this.unsubscribe = unsubscribe;
        console.log('Real-time updates initialized');
    }

    /**
     * Refresh display
     */
    refresh() {
        this.loadAndDisplayModels();
    }
}

// Create global instance
window.modelDisplay = new ModelDisplay();