// Premium Models JavaScript Implementation

/**
 * Premium Model Management System
 */
class PremiumModelManager {
    constructor() {
        // Don't set storageAdapter in constructor as it might not be ready
        this.storageAdapter = null;
    }
    
    getStorageAdapter() {
        if (!this.storageAdapter) {
            this.storageAdapter = window.modelStorageAdapter;
        }
        return this.storageAdapter;
    }

    /**
     * Load and display premium models in showcase
     */
    async loadPremiumShowcase(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            container.innerHTML = '<div class="premium-loading">프리미엄 모델 로딩 중</div>';
            
            const models = await this.getPremiumModels();
            
            if (models.length === 0) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = `
                <div class="premium-section">
                    <div class="section-header premium-header">
                        <h2>⭐ 프리미엄 모델</h2>
                        <span class="premium-count">${models.length}명의 프리미엄 모델</span>
                    </div>
                    <div class="model-grid premium-grid">
                        ${models.map(model => this.createPremiumModelCard(model)).join('')}
                    </div>
                </div>
                <div class="section-divider"></div>
            `;

        } catch (error) {
            console.error('Error loading premium models:', error);
            container.innerHTML = '<p class="error-message">프리미엄 모델을 불러오는 중 오류가 발생했습니다.</p>';
        }
    }

    /**
     * Load premium models for movie maker carousel
     */
    async loadPremiumCarousel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const models = await this.getPremiumModels(20); // Show up to 20 models
            
            if (models.length === 0) {
                // Hide the entire premium section if no premium models
                const premiumSection = document.getElementById('premiumModelsSection');
                if (premiumSection) {
                    premiumSection.style.display = 'none';
                }
                return;
            }

            // Create wrapper for horizontal scrolling
            container.innerHTML = `
                <div class="premium-models-wrapper">
                    ${models.map(model => this.createSimplifiedPremiumCard(model)).join('')}
                </div>
            `;

            // Add navigation buttons to premium section
            const premiumSection = document.getElementById('premiumModelsSection');
            if (premiumSection) {
                // Add navigation buttons if not already present
                if (!premiumSection.querySelector('.premium-carousel-nav')) {
                    const navButtonsHTML = `
                        <button class="premium-carousel-nav prev" onclick="premiumManager.scrollCarousel('prev')">
                            <svg viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                            </svg>
                        </button>
                        <button class="premium-carousel-nav next" onclick="premiumManager.scrollCarousel('next')">
                            <svg viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                        </button>
                    `;
                    premiumSection.insertAdjacentHTML('beforeend', navButtonsHTML);
                }
                
                // Add view all button if not present
                if (!premiumSection.querySelector('.view-all-premium')) {
                    const viewAllDiv = document.createElement('div');
                    viewAllDiv.className = 'view-all-premium';
                    viewAllDiv.innerHTML = `
                        <a href="models.html?filter=premium" class="btn">
                            모든 프리미엄 모델 보기
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                        </a>
                    `;
                    premiumSection.appendChild(viewAllDiv);
                }
            }

            // Initialize scroll position and auto-scroll
            this.carouselContainer = container;
            this.initializeAutoScroll();

        } catch (error) {
            console.error('Error loading premium carousel:', error);
        }
    }

    /**
     * Get premium models from database
     */
    async getPremiumModels(limit = 50) {
        // Get storage adapter
        const adapter = this.getStorageAdapter();
        if (!adapter) {
            console.error('Storage adapter not available');
            return [];
        }
        
        // Get all active models
        const allModels = await adapter.getActiveModels();
        
        // Filter and sort premium models
        let premiumModels = allModels
            .filter(model => model.tier === 'premium' || model.tier === 'vip')
            .sort((a, b) => {
                // Sort by tier (VIP first) then by sortPriority
                if (a.tier === 'vip' && b.tier !== 'vip') return -1;
                if (b.tier === 'vip' && a.tier !== 'vip') return 1;
                return (b.sortPriority || 0) - (a.sortPriority || 0);
            })
            .slice(0, limit);

        // For testing: If no premium models exist, show first 2 regular models as premium
        if (premiumModels.length === 0 && allModels.length > 0) {
            console.log('[Premium Models] No premium models found, using test data');
            premiumModels = allModels.slice(0, 2).map(model => ({
                ...model,
                tier: 'premium',
                premiumBadge: '⭐ 프리미엄 (테스트)',
                sortPriority: 1000
            }));
        }

        return premiumModels;
    }

    /**
     * Create premium model card HTML
     */
    createPremiumModelCard(model) {
        const badge = model.premiumBadge || (model.tier === 'vip' ? '💎 VIP 모델' : '⭐ 프리미엄');
        const badgeClass = model.tier === 'vip' ? 'vip-badge' : '';

        return `
            <div class="model-card premium-model-card" onclick="viewModel('${model.id}')">
                <div class="premium-badge ${badgeClass}">${badge}</div>
                <div class="model-image premium-image">
                    <img src="${model.profileImage}" alt="${model.displayName}" loading="lazy">
                    ${model.premiumVideo ? `
                        <div class="video-preview-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    ` : ''}
                </div>
                <div class="model-info premium-info">
                    <h3>${model.displayName}</h3>
                    <p class="tagline">${model.tagline || ''}</p>
                    <div class="model-stats">
                        ${model.rating > 0 ? `<span class="rating">⭐ ${Number(model.rating).toFixed(1)}</span>` : ''}
                        <span class="licenses">${model.totalLicenses || 0}건</span>
                        ${model.responseTime ? `<span class="response">⚡ ${model.responseTime}</span>` : ''}
                    </div>
                    <div class="premium-features">
                        ${this.getPremiumFeatures(model.tier).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create large premium card for carousel
     */
    createLargePremiumCard(model) {
        const badge = model.premiumBadge || (model.tier === 'vip' ? '💎 VIP' : '⭐ PREMIUM');
        const isTopRated = model.rating >= 4.5;

        return `
            <div class="premium-model-card large" onclick="selectModel('${model.id}')">
                <div class="premium-indicator">
                    <span class="premium-badge ${model.tier === 'vip' ? 'vip-badge' : ''}">${badge}</span>
                    ${isTopRated ? '<span class="top-rated">TOP RATED</span>' : ''}
                </div>
                <div class="model-visual">
                    <img src="${model.profileImage}" alt="${model.displayName}" loading="lazy">
                    ${model.premiumVideo ? `
                        <button class="preview-video-btn" onclick="event.stopPropagation(); previewVideo('${model.premiumVideo}')">
                            <svg viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            미리보기
                        </button>
                    ` : ''}
                </div>
                <div class="model-details">
                    <h4>${model.displayName}</h4>
                    <p class="premium-tagline">${model.tagline || '프로페셔널 모델'}</p>
                    <div class="model-highlights">
                        <span>📊 ${model.totalLicenses || 0}+ 프로젝트</span>
                        <span>⭐ ${model.rating || 'New'}</span>
                        <span>⚡ ${model.responseTime || '빠른 응답'}</span>
                    </div>
                    <div class="price-preview">
                        <span class="from-price">₩${(model.lowestPrice || 300000).toLocaleString()}부터</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create simplified premium card for index page
     */
    createSimplifiedPremiumCard(model) {
        const badge = model.tier === 'vip' ? '💎 VIP' : '⭐ 프리미엄';

        return `
            <div class="premium-model-card simplified" onclick="selectModel('${model.id}')">
                <div class="model-visual">
                    <img src="${model.profileImage}" alt="${model.displayName}" loading="lazy">
                    <div class="premium-indicator">
                        <span class="premium-badge ${model.tier === 'vip' ? 'vip-badge' : ''}">${badge}</span>
                    </div>
                </div>
                <div class="model-details">
                    <h4>${model.displayName}</h4>
                    <p class="premium-tagline">${model.tagline || '프로페셔널 모델'}</p>
                </div>
            </div>
        `;
    }

    /**
     * Get premium features based on tier
     */
    getPremiumFeatures(tier) {
        const features = {
            premium: ['빠른 응답', '검증된 프로필', '우선 노출'],
            vip: ['VIP 전담 지원', '마케팅 지원', '최우선 노출', '맞춤 계약']
        };
        return features[tier] || features.premium;
    }

    /**
     * Initialize carousel functionality
     */
    initializeCarousel(container) {
        // Add navigation buttons
        const wrapper = container.parentElement;
        
        const navHTML = `
            <button class="carousel-nav carousel-prev" onclick="premiumManager.scrollCarousel('${container.id}', -1)">
                <svg viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
            </button>
            <button class="carousel-nav carousel-next" onclick="premiumManager.scrollCarousel('${container.id}', 1)">
                <svg viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
            </button>
        `;
        
        wrapper.insertAdjacentHTML('beforeend', navHTML);
        
        // Check scroll position for button visibility
        this.updateCarouselButtons(container);
        container.addEventListener('scroll', () => this.updateCarouselButtons(container));
    }

    /**
     * Scroll carousel
     */
    scrollCarousel(direction) {
        if (!this.carouselContainer) return;
        
        // Stop auto-scroll when manually scrolling
        this.stopAutoScroll();
        
        const scrollAmount = 220; // Width of card + gap
        const currentScroll = this.carouselContainer.scrollLeft;
        
        if (direction === 'prev') {
            this.carouselContainer.scrollTo({
                left: currentScroll - scrollAmount,
                behavior: 'smooth'
            });
        } else {
            this.carouselContainer.scrollTo({
                left: currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
        
        // Resume auto-scroll after manual scroll
        setTimeout(() => this.startAutoScroll(), 5000);
    }

    /**
     * Initialize auto-scroll functionality
     */
    initializeAutoScroll() {
        if (!this.carouselContainer) return;
        
        // Start auto-scroll
        this.startAutoScroll();
        
        // Stop on hover
        this.carouselContainer.addEventListener('mouseenter', () => {
            this.stopAutoScroll();
        });
        
        // Resume on mouse leave
        this.carouselContainer.addEventListener('mouseleave', () => {
            this.startAutoScroll();
        });
        
        // Stop on manual scroll
        let isScrolling;
        this.carouselContainer.addEventListener('scroll', () => {
            this.stopAutoScroll();
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                this.startAutoScroll();
            }, 3000);
        });
    }

    /**
     * Start auto-scrolling
     */
    startAutoScroll() {
        if (this.autoScrollInterval) return;
        
        this.autoScrollInterval = setInterval(() => {
            if (!this.carouselContainer) {
                this.stopAutoScroll();
                return;
            }
            
            const maxScroll = this.carouselContainer.scrollWidth - this.carouselContainer.clientWidth;
            const currentScroll = this.carouselContainer.scrollLeft;
            
            // Check if we've reached the end
            if (currentScroll >= maxScroll - 10) {
                // Scroll back to beginning
                this.carouselContainer.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                // Scroll one card width
                this.carouselContainer.scrollBy({
                    left: 220,
                    behavior: 'smooth'
                });
            }
        }, 3000); // Auto-scroll every 3 seconds
    }

    /**
     * Stop auto-scrolling
     */
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }

    /**
     * Update carousel button visibility
     */
    updateCarouselButtons(container) {
        const wrapper = container.parentElement;
        const prevBtn = wrapper.querySelector('.carousel-prev');
        const nextBtn = wrapper.querySelector('.carousel-next');
        
        if (prevBtn) {
            prevBtn.style.display = container.scrollLeft > 0 ? 'flex' : 'none';
        }
        
        if (nextBtn) {
            const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 10;
            nextBtn.style.display = isAtEnd ? 'none' : 'flex';
        }
    }
}

// Initialize premium manager
const premiumManager = new PremiumModelManager();

// Admin functions for premium management
async function togglePremiumStatus(modelId) {
    try {
        const model = await window.modelStorageAdapter.getModel(modelId);
        const currentTier = model.tier || 'basic';
        
        const modal = createPremiumModal(model, currentTier);
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error toggling premium status:', error);
        alert('프리미엄 상태 변경 중 오류가 발생했습니다.');
    }
}

function createPremiumModal(model, currentTier) {
    const modalHTML = `
        <div class="modal-overlay" onclick="closePremiumModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <h3>프리미엄 상태 관리</h3>
                <p><strong>모델:</strong> ${model.displayName}</p>
                <p><strong>현재 등급:</strong> ${getTierDisplayName(currentTier)}</p>
                
                <form id="premiumForm">
                    <div class="form-group">
                        <label>새 등급:</label>
                        <select name="tier" class="form-control">
                            <option value="basic" ${currentTier === 'basic' ? 'selected' : ''}>일반 (Basic)</option>
                            <option value="premium" ${currentTier === 'premium' ? 'selected' : ''}>프리미엄 (Premium)</option>
                            <option value="vip" ${currentTier === 'vip' ? 'selected' : ''}>VIP</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>기간:</label>
                        <select name="duration" class="form-control">
                            <option value="1">1개월</option>
                            <option value="3">3개월</option>
                            <option value="6" selected>6개월</option>
                            <option value="12">1년</option>
                            <option value="0">영구</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>커스텀 배지 텍스트:</label>
                        <input type="text" name="badgeText" class="form-control" 
                               placeholder="예: ⭐ 프리미엄 모델" 
                               value="${model.premiumBadge || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label>정렬 우선순위 (높을수록 상단):</label>
                        <input type="number" name="sortPriority" class="form-control" 
                               value="${model.sortPriority || 1000}" 
                               min="0" max="9999">
                    </div>
                    
                    <div class="form-group">
                        <label>메모:</label>
                        <textarea name="notes" class="form-control" rows="3" 
                                  placeholder="상태 변경 사유"></textarea>
                    </div>
                    
                    <div class="modal-buttons">
                        <button type="submit" class="btn btn-primary">상태 업데이트</button>
                        <button type="button" class="btn btn-secondary" onclick="closePremiumModal()">취소</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'premium-modal';
    modal.innerHTML = modalHTML;
    
    // Add form submit handler
    modal.querySelector('#premiumForm').onsubmit = async (e) => {
        e.preventDefault();
        await updatePremiumStatus(model.id, new FormData(e.target));
        closePremiumModal();
    };
    
    return modal;
}

async function updatePremiumStatus(modelId, formData) {
    try {
        const tierData = {
            tier: formData.get('tier'),
            duration: parseInt(formData.get('duration')),
            badgeText: formData.get('badgeText'),
            sortPriority: parseInt(formData.get('sortPriority')),
            notes: formData.get('notes')
        };
        
        await window.modelStorageAdapter.updateModelTier(modelId, tierData);
        
        alert('프리미엄 상태가 성공적으로 업데이트되었습니다.');
        
        // Reload the page or update the UI
        if (typeof loadModels === 'function') {
            loadModels();
        }
        
    } catch (error) {
        console.error('Error updating premium status:', error);
        alert('프리미엄 상태 업데이트 중 오류가 발생했습니다.');
    }
}

function closePremiumModal() {
    const modal = document.querySelector('.premium-modal');
    if (modal) {
        modal.remove();
    }
}

function getTierDisplayName(tier) {
    const names = {
        basic: '일반',
        premium: '프리미엄',
        vip: 'VIP'
    };
    return names[tier] || tier;
}

// Export for use in other files
window.premiumManager = premiumManager;

// Carousel navigation styles
const carouselStyles = `
<style>
.carousel-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #e2e8f0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    z-index: 5;
}

.carousel-nav:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.carousel-nav svg {
    width: 24px;
    height: 24px;
    fill: #4a5568;
}

.carousel-prev {
    left: -20px;
}

.carousel-next {
    right: -20px;
}

.premium-models-section {
    position: relative;
}

/* Premium Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-content h3 {
    margin: 0 0 20px 0;
    color: #2d3748;
    font-size: 1.5em;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #4a5568;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1em;
    transition: border-color 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #667eea;
}

.modal-buttons {
    display: flex;
    gap: 12px;
    margin-top: 30px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5a67d8;
}

.btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
}

.btn-secondary:hover {
    background: #cbd5e0;
}
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', carouselStyles);