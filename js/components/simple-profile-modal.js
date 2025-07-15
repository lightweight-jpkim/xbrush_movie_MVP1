/**
 * Simplified Profile Modal for Model Booking
 * Shows only essential information for booking decisions
 */

class SimpleProfileModal {
    constructor() {
        this.modal = null;
        this.currentModel = null;
        this.init();
    }
    
    init() {
        this.createModalStructure();
        this.attachEventListeners();
    }
    
    createModalStructure() {
        const modalHTML = `
            <div id="simpleProfileModal" class="simple-profile-modal">
                <div class="modal-overlay"></div>
                <div class="modal-container">
                    <button class="modal-close" aria-label="Close">×</button>
                    
                    <div class="modal-content">
                        <!-- Profile Header -->
                        <div class="profile-header">
                            <img class="profile-image" src="" alt="">
                            <div class="profile-info">
                                <div class="profile-badges"></div>
                                <h1 class="profile-name"></h1>
                                <p class="profile-tagline"></p>
                                <div class="profile-meta">
                                    <span class="availability-status"></span>
                                    <span class="price-range"></span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabs -->
                        <div class="profile-tabs">
                            <button class="tab-btn active" data-tab="portfolio">포트폴리오</button>
                            <button class="tab-btn" data-tab="about">소개</button>
                        </div>
                        
                        <!-- Tab Contents -->
                        <div class="tab-contents">
                            <!-- Portfolio Tab -->
                            <div class="tab-content active" data-content="portfolio">
                                <div class="portfolio-grid"></div>
                            </div>
                            
                            <!-- About Tab -->
                            <div class="tab-content" data-content="about">
                                <div class="about-section">
                                    <h3>소개</h3>
                                    <p class="model-bio"></p>
                                    
                                    <h3>전문 분야</h3>
                                    <div class="specialty-tags"></div>
                                    
                                    <div class="contact-section">
                                        <h3>예약 문의</h3>
                                        <p class="contact-email"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="modal-actions">
                            <button class="btn btn-primary btn-use-model">
                                이 모델로 동영상 제작하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('simpleProfileModal');
    }
    
    attachEventListeners() {
        // Close button
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        
        // Overlay click
        this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());
        
        // Tab switching
        this.modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Use model button
        this.modal.querySelector('.btn-use-model').addEventListener('click', () => {
            if (this.currentModel) {
                sessionStorage.setItem('selectedModelForMovie', this.currentModel.id);
                sessionStorage.setItem('skipToStep2', 'true');
                window.location.href = 'index.html#step2';
            }
        });
    }
    
    async open(modelId) {
        try {
            // Show loading state
            this.modal.classList.add('loading');
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Fetch model data
            const model = await this.fetchModelData(modelId);
            if (!model) {
                throw new Error('Model not found');
            }
            
            this.currentModel = model;
            this.renderModelData(model);
            
            // Show modal with animation
            this.modal.classList.remove('loading');
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });
            
        } catch (error) {
            console.error('Error loading model:', error);
            this.close();
            if (window.showToast) {
                window.showToast('모델 정보를 불러올 수 없습니다.', 'error');
            }
        }
    }
    
    close() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            this.currentModel = null;
        }, 300);
    }
    
    async fetchModelData(modelId) {
        if (window.modelStorageAdapter) {
            return await window.modelStorageAdapter.getModel(modelId);
        }
        return null;
    }
    
    renderModelData(model) {
        // Profile image
        this.modal.querySelector('.profile-image').src = 
            model.portfolio?.thumbnailUrl || 'https://via.placeholder.com/400x400';
        
        // Name and tagline
        this.modal.querySelector('.profile-name').textContent = 
            model.personalInfo?.name || 'Unknown Model';
        this.modal.querySelector('.profile-tagline').textContent = 
            model.profile?.tagline || '프로페셔널 모델';
        
        // Badges
        const badgesContainer = this.modal.querySelector('.profile-badges');
        badgesContainer.innerHTML = '';
        
        if (model.profile?.verificationStatus?.identity) {
            badgesContainer.innerHTML += '<span class="badge verified">✓ 인증됨</span>';
        }
        
        if (model.pricing?.tier === 'premium') {
            badgesContainer.innerHTML += '<span class="badge premium">⭐ 프리미엄</span>';
        } else if (model.pricing?.tier === 'vip') {
            badgesContainer.innerHTML += '<span class="badge vip">💎 VIP</span>';
        }
        
        // Availability status
        const statusEl = this.modal.querySelector('.availability-status');
        const isAvailable = model.availability?.status === 'available';
        statusEl.textContent = isAvailable ? '✅ 예약 가능' : '⏸️ 예약 중';
        statusEl.className = `availability-status ${isAvailable ? 'available' : 'busy'}`;
        
        // Price
        const priceEl = this.modal.querySelector('.price-range');
        const price = model.pricing?.basePrice || 100000;
        priceEl.textContent = `₩${price.toLocaleString('ko-KR')}부터`;
        
        // Bio
        this.modal.querySelector('.model-bio').textContent = 
            model.profile?.bio || '안녕하세요! 프로페셔널 모델입니다.';
        
        // Specialties
        const specialtiesContainer = this.modal.querySelector('.specialty-tags');
        const specialties = model.profile?.specialties || ['fashion'];
        specialtiesContainer.innerHTML = specialties
            .map(spec => `<span class="tag">${this.getSpecialtyName(spec)}</span>`)
            .join('');
        
        // Contact email
        this.modal.querySelector('.contact-email').textContent = 
            model.personalInfo?.email || 'contact@xbrush.com';
        
        // Portfolio
        this.renderPortfolio(model);
    }
    
    renderPortfolio(model) {
        const portfolioGrid = this.modal.querySelector('.portfolio-grid');
        const gallery = model.portfolio?.gallery || [];
        
        if (gallery.length === 0) {
            portfolioGrid.innerHTML = `
                <div class="empty-portfolio">
                    <img src="${model.portfolio?.thumbnailUrl || 'https://via.placeholder.com/400x400'}" 
                         alt="${model.personalInfo?.name || 'Model'}"
                         class="single-portfolio-image">
                </div>
            `;
            return;
        }
        
        portfolioGrid.innerHTML = gallery.slice(0, 6).map(item => `
            <div class="portfolio-item">
                <img src="${item.url}" alt="${item.caption || ''}" loading="lazy">
            </div>
        `).join('');
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.modal.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });
    }
    
    getSpecialtyName(specialty) {
        const map = {
            'fashion': '패션',
            'beauty': '뷰티',
            'lifestyle': '라이프스타일',
            'commercial': '광고',
            'food': '푸드',
            'tech': '테크'
        };
        return map[specialty] || specialty;
    }
}

// Create global instance
window.simpleProfileModal = new SimpleProfileModal();