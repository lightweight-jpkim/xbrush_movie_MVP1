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
            return;
        }

        try {
            // Show loading state
            this.modelsContainer.innerHTML = '<div class="loading-state">모델을 불러오는 중...</div>';
            
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
            this.modelsContainer.innerHTML = '<div class="error-state">모델을 불러오는 중 오류가 발생했습니다.</div>';
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
            portfolio = {},
            contract = {},
            registrationDate
        } = model;

        const name = personalInfo.name || '이름 없음';
        const intro = personalInfo.intro || '소개글이 없습니다';
        const categories = personalInfo.categories || [];
        // Use actual thumbnail or fallback to a nice default
        const thumbnail = portfolio.thumbnailUrl || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop';
        const price = contract.basePrice || 0;

        // Format categories
        const categoryBadges = categories.map(cat => {
            const categoryMap = {
                'fashion': { name: '패션', color: '#667eea' },
                'beauty': { name: '뷰티', color: '#f56565' },
                'lifestyle': { name: '라이프스타일', color: '#48bb78' },
                'food': { name: '푸드', color: '#ed8936' },
                'tech': { name: '테크', color: '#38b2ac' }
            };
            const catInfo = categoryMap[cat] || { name: cat, color: '#718096' };
            
            return `<span class="category-badge" style="background-color: ${catInfo.color}">${catInfo.name}</span>`;
        }).join('');

        // Format price
        const formattedPrice = new Intl.NumberFormat('ko-KR').format(price);

        return `
            <div class="model-card" data-model-id="${id}">
                <div class="model-card-image">
                    <img src="${thumbnail}" alt="${name}">
                    <div class="model-card-overlay">
                        <button class="view-profile-btn">프로필 보기</button>
                    </div>
                </div>
                <div class="model-card-content">
                    <h3 class="model-name">${name}</h3>
                    <p class="model-intro">${intro}</p>
                    <div class="model-categories">
                        ${categoryBadges}
                    </div>
                    <div class="model-card-footer">
                        <div class="model-price">
                            <span class="price-label">시작가</span>
                            <span class="price-value">₩${formattedPrice}</span>
                        </div>
                        <div class="model-rating">
                            <span class="rating-stars">⭐⭐⭐⭐⭐</span>
                            <span class="rating-count">(0)</span>
                        </div>
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
                return sortedModels.sort((a, b) => 
                    (b.contract?.basePrice || 0) - (a.contract?.basePrice || 0)
                );
            case 'priceLow':
                return sortedModels.sort((a, b) => 
                    (a.contract?.basePrice || 0) - (b.contract?.basePrice || 0)
                );
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
        // For now, just log - later this will navigate to profile page
        console.log('View profile for model:', modelId);
        
        // Store selected model ID
        sessionStorage.setItem('selectedModelId', modelId);
        
        // Navigate to profile page (when implemented)
        // window.location.href = `model-profile.html?id=${modelId}`;
        
        // For now, show a toast
        if (window.showToast) {
            window.showToast('프로필 페이지는 준비 중입니다', 'info');
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