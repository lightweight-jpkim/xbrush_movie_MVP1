/**
 * Model Detail Modal Component
 * Professional model profile viewer with commercial features
 */

class ModelDetailModal {
    constructor() {
        this.modal = null;
        this.currentModel = null;
        this.selectedPackage = null;
        this.init();
    }
    
    init() {
        // Create modal structure
        this.createModalStructure();
        this.attachEventListeners();
    }
    
    createModalStructure() {
        const modalHTML = `
            <div id="modelDetailModal" class="model-detail-modal">
                <div class="modal-overlay"></div>
                <div class="modal-container">
                    <button class="modal-close" aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M6 6l12 12M6 18L18 6" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    
                    <div class="modal-content">
                        <!-- Hero Section -->
                        <div class="model-hero">
                            <div class="hero-background"></div>
                            <div class="hero-content">
                                <div class="model-avatar-large">
                                    <img class="model-avatar-img" src="" alt="">
                                    <div class="online-indicator"></div>
                                </div>
                                <div class="model-hero-info">
                                    <div class="model-badges">
                                        <span class="badge badge-verified" style="display:none">✓ Verified</span>
                                        <span class="badge badge-pro" style="display:none">PRO</span>
                                        <span class="badge badge-new" style="display:none">NEW</span>
                                    </div>
                                    <h1 class="model-name"></h1>
                                    <p class="model-tagline"></p>
                                    <div class="model-stats-row">
                                        <div class="stat-item">
                                            <span class="stat-value model-rating">0.0</span>
                                            <span class="stat-label">평점</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-value model-projects">0</span>
                                            <span class="stat-label">완료 프로젝트</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-value model-response">2시간</span>
                                            <span class="stat-label">응답 시간</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="hero-actions">
                                    <button class="btn btn-primary btn-contact">
                                        <span class="btn-icon">💬</span>
                                        문의하기
                                    </button>
                                    <button class="btn btn-secondary btn-save">
                                        <span class="btn-icon">♡</span>
                                        저장
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Navigation Tabs -->
                        <div class="modal-nav">
                            <button class="nav-tab active" data-tab="overview">개요</button>
                            <button class="nav-tab" data-tab="portfolio">포트폴리오</button>
                            <button class="nav-tab" data-tab="packages">패키지/가격</button>
                            <button class="nav-tab" data-tab="reviews">리뷰</button>
                            <button class="nav-tab" data-tab="about">소개</button>
                        </div>
                        
                        <!-- Tab Contents -->
                        <div class="modal-body">
                            <!-- Overview Tab -->
                            <div class="tab-content active" data-content="overview">
                                <div class="overview-grid">
                                    <!-- About Section -->
                                    <div class="overview-section">
                                        <h3>소개</h3>
                                        <p class="model-bio"></p>
                                        <div class="model-specialties">
                                            <h4>전문 분야</h4>
                                            <div class="specialty-tags"></div>
                                        </div>
                                        <div class="model-languages">
                                            <h4>사용 언어</h4>
                                            <div class="language-tags"></div>
                                        </div>
                                    </div>
                                    
                                    <!-- Quick Stats -->
                                    <div class="overview-section">
                                        <h3>빠른 정보</h3>
                                        <div class="quick-stats">
                                            <div class="quick-stat">
                                                <span class="icon">📍</span>
                                                <span class="label">위치</span>
                                                <span class="value model-location">서울, 대한민국</span>
                                            </div>
                                            <div class="quick-stat">
                                                <span class="icon">💼</span>
                                                <span class="label">경력</span>
                                                <span class="value model-experience">5년+</span>
                                            </div>
                                            <div class="quick-stat">
                                                <span class="icon">⏱️</span>
                                                <span class="label">가입일</span>
                                                <span class="value model-joined">2024년 1월</span>
                                            </div>
                                            <div class="quick-stat">
                                                <span class="icon">🔄</span>
                                                <span class="label">재구매율</span>
                                                <span class="value model-repeat">85%</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Recent Portfolio Preview -->
                                    <div class="overview-section full-width">
                                        <h3>최근 작업</h3>
                                        <div class="portfolio-preview"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Portfolio Tab -->
                            <div class="tab-content" data-content="portfolio">
                                <div class="portfolio-filters">
                                    <button class="filter-btn active" data-filter="all">전체</button>
                                    <button class="filter-btn" data-filter="fashion">패션</button>
                                    <button class="filter-btn" data-filter="beauty">뷰티</button>
                                    <button class="filter-btn" data-filter="lifestyle">라이프스타일</button>
                                    <button class="filter-btn" data-filter="commercial">광고</button>
                                </div>
                                <div class="portfolio-grid"></div>
                            </div>
                            
                            <!-- Packages Tab -->
                            <div class="tab-content" data-content="packages">
                                <div class="packages-container">
                                    <div class="packages-grid"></div>
                                    <div class="custom-quote-section">
                                        <h3>맞춤 견적이 필요하신가요?</h3>
                                        <p>프로젝트에 맞는 맞춤형 패키지를 제안해드립니다.</p>
                                        <button class="btn btn-primary">맞춤 견적 요청</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Reviews Tab -->
                            <div class="tab-content" data-content="reviews">
                                <div class="reviews-summary">
                                    <div class="rating-overview">
                                        <div class="rating-score">
                                            <span class="score">4.8</span>
                                            <div class="stars">⭐⭐⭐⭐⭐</div>
                                            <span class="count">127개 리뷰</span>
                                        </div>
                                        <div class="rating-breakdown">
                                            <div class="rating-bar">
                                                <span>5점</span>
                                                <div class="bar"><div class="fill" style="width: 80%"></div></div>
                                                <span>80%</span>
                                            </div>
                                            <div class="rating-bar">
                                                <span>4점</span>
                                                <div class="bar"><div class="fill" style="width: 15%"></div></div>
                                                <span>15%</span>
                                            </div>
                                            <div class="rating-bar">
                                                <span>3점</span>
                                                <div class="bar"><div class="fill" style="width: 3%"></div></div>
                                                <span>3%</span>
                                            </div>
                                            <div class="rating-bar">
                                                <span>2점</span>
                                                <div class="bar"><div class="fill" style="width: 1%"></div></div>
                                                <span>1%</span>
                                            </div>
                                            <div class="rating-bar">
                                                <span>1점</span>
                                                <div class="bar"><div class="fill" style="width: 1%"></div></div>
                                                <span>1%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="rating-categories">
                                        <div class="category-rating">
                                            <span>커뮤니케이션</span>
                                            <div class="mini-stars">⭐⭐⭐⭐⭐</div>
                                            <span>4.9</span>
                                        </div>
                                        <div class="category-rating">
                                            <span>품질</span>
                                            <div class="mini-stars">⭐⭐⭐⭐⭐</div>
                                            <span>4.8</span>
                                        </div>
                                        <div class="category-rating">
                                            <span>납기</span>
                                            <div class="mini-stars">⭐⭐⭐⭐⭐</div>
                                            <span>4.7</span>
                                        </div>
                                        <div class="category-rating">
                                            <span>가성비</span>
                                            <div class="mini-stars">⭐⭐⭐⭐⭐</div>
                                            <span>4.8</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="reviews-filter">
                                    <select>
                                        <option>최신순</option>
                                        <option>높은 평점순</option>
                                        <option>낮은 평점순</option>
                                        <option>도움이 된 순</option>
                                    </select>
                                </div>
                                <div class="reviews-list"></div>
                            </div>
                            
                            <!-- About Tab -->
                            <div class="tab-content" data-content="about">
                                <div class="about-sections">
                                    <section class="about-section">
                                        <h3>자기소개</h3>
                                        <div class="model-full-bio"></div>
                                    </section>
                                    <section class="about-section">
                                        <h3>경력 사항</h3>
                                        <div class="model-experience-list"></div>
                                    </section>
                                    <section class="about-section">
                                        <h3>보유 기술</h3>
                                        <div class="model-skills"></div>
                                    </section>
                                    <section class="about-section">
                                        <h3>작업 스타일</h3>
                                        <div class="model-work-style"></div>
                                    </section>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bottom CTA -->
                        <div class="modal-footer">
                            <div class="package-selector">
                                <select class="package-select">
                                    <option>패키지를 선택하세요</option>
                                </select>
                                <div class="selected-price">₩0</div>
                            </div>
                            <button class="btn btn-primary btn-large btn-order">
                                주문하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('modelDetailModal');
    }
    
    attachEventListeners() {
        // Close button
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());
        
        // Tab navigation
        this.modal.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Portfolio filters
        this.modal.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterPortfolio(e.target.dataset.filter));
        });
        
        // Contact button
        this.modal.querySelector('.btn-contact').addEventListener('click', () => this.handleContact());
        
        // Save button
        this.modal.querySelector('.btn-save').addEventListener('click', () => this.handleSave());
        
        // Order button
        this.modal.querySelector('.btn-order').addEventListener('click', () => this.handleOrder());
        
        // Package selector
        this.modal.querySelector('.package-select').addEventListener('change', (e) => this.selectPackage(e.target.value));
    }
    
    async open(modelId) {
        try {
            // Show loading state
            this.modal.classList.add('loading');
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Fetch model data
            const model = await this.fetchModelData(modelId);
            if (!model) {
                throw new Error('Model not found');
            }
            
            this.currentModel = model;
            this.renderModelData(model);
            
            // Remove loading state
            this.modal.classList.remove('loading');
            
            // Add animation class
            requestAnimationFrame(() => {
                this.modal.classList.add('active');
            });
            
            // Track view
            this.trackView(modelId);
            
        } catch (error) {
            console.error('Error opening model detail:', error);
            this.close();
            if (window.showToast) {
                window.showToast('모델 정보를 불러올 수 없습니다.', 'error');
            }
        }
    }
    
    close() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            this.currentModel = null;
            this.selectedPackage = null;
        }, 300);
    }
    
    async fetchModelData(modelId) {
        // Fetch from Firebase using the adapter
        if (window.modelStorageAdapter) {
            return await window.modelStorageAdapter.getModel(modelId);
        } else if (window.modelStorage) {
            return await window.modelStorage.getModel(modelId);
        }
        return null;
    }
    
    renderModelData(model) {
        // Hero section
        this.modal.querySelector('.model-avatar-img').src = model.portfolio?.thumbnailUrl || '/images/default-avatar.png';
        this.modal.querySelector('.model-name').textContent = model.personalInfo?.name || 'Unknown Model';
        this.modal.querySelector('.model-tagline').textContent = model.profile?.tagline || '프로페셔널 AI 모델';
        
        // Stats - Handle missing stats gracefully
        const ratingEl = this.modal.querySelector('.model-rating');
        const projectsEl = this.modal.querySelector('.model-projects');
        const responseEl = this.modal.querySelector('.model-response');
        
        if (ratingEl) ratingEl.textContent = (model.ratings?.overall || 0).toFixed(1);
        if (projectsEl) projectsEl.textContent = model.stats?.completedProjects || 0;
        if (responseEl) responseEl.textContent = `${model.stats?.responseTime || 2}시간`;
        
        // Badges
        if (model.profile?.verificationStatus?.identity) {
            this.modal.querySelector('.badge-verified').style.display = 'inline-flex';
        }
        if (model.profile?.verificationStatus?.premium) {
            this.modal.querySelector('.badge-pro').style.display = 'inline-flex';
        }
        if (model.flags?.newModel) {
            this.modal.querySelector('.badge-new').style.display = 'inline-flex';
        }
        
        // Online status
        const isOnline = model.availability?.status === 'available';
        this.modal.querySelector('.online-indicator').classList.toggle('online', isOnline);
        
        // Overview tab
        this.renderOverview(model);
        
        // Portfolio tab
        this.renderPortfolio(model);
        
        // Packages tab
        this.renderPackages(model);
        
        // Reviews tab
        this.renderReviews(model);
        
        // About tab
        this.renderAbout(model);
    }
    
    renderOverview(model) {
        // Bio
        this.modal.querySelector('.model-bio').textContent = 
            model.profile?.bio || '안녕하세요! 프로페셔널 AI 모델입니다.';
        
        // Specialties
        const specialtiesContainer = this.modal.querySelector('.specialty-tags');
        specialtiesContainer.innerHTML = (model.profile?.specialties || ['fashion', 'beauty'])
            .map(specialty => `<span class="tag">${this.getSpecialtyName(specialty)}</span>`)
            .join('');
        
        // Languages
        const languagesContainer = this.modal.querySelector('.language-tags');
        languagesContainer.innerHTML = (model.profile?.languages || ['ko'])
            .map(lang => `<span class="tag">${this.getLanguageName(lang)}</span>`)
            .join('');
        
        // Quick stats
        this.modal.querySelector('.model-location').textContent = 
            model.profile?.location || '서울, 대한민국';
        this.modal.querySelector('.model-experience').textContent = 
            model.profile?.experience || '1년+';
        this.modal.querySelector('.model-joined').textContent = 
            this.formatDate(model.stats?.joinedDate);
        this.modal.querySelector('.model-repeat').textContent = 
            `${Math.round((model.stats?.repeatClients / Math.max(model.stats?.totalClients, 1)) * 100)}%`;
        
        // Portfolio preview
        this.renderPortfolioPreview(model);
    }
    
    renderPortfolio(model) {
        const portfolioGrid = this.modal.querySelector('.portfolio-grid');
        const gallery = model.portfolio?.gallery || [];
        
        if (gallery.length === 0) {
            portfolioGrid.innerHTML = '<p class="empty-state">아직 포트폴리오가 없습니다.</p>';
            return;
        }
        
        portfolioGrid.innerHTML = gallery.map(item => `
            <div class="portfolio-item" data-category="${item.category || 'all'}">
                <img src="${item.url}" alt="${item.caption}" loading="lazy">
                <div class="portfolio-overlay">
                    <p>${item.caption || ''}</p>
                </div>
            </div>
        `).join('');
    }
    
    renderPackages(model) {
        const packagesGrid = this.modal.querySelector('.packages-grid');
        const packages = model.pricing?.packages || [];
        
        packagesGrid.innerHTML = packages.map(pkg => `
            <div class="package-card ${pkg.popular ? 'popular' : ''}" data-package-id="${pkg.id}">
                ${pkg.popular ? '<div class="popular-badge">인기</div>' : ''}
                <h3>${pkg.name}</h3>
                <div class="package-price">₩${pkg.price.toLocaleString()}</div>
                <p class="package-description">${pkg.description}</p>
                <ul class="package-features">
                    ${pkg.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="package-meta">
                    <span>🚚 ${pkg.deliveryTime}일 이내 완료</span>
                    <span>🔄 ${pkg.revisions === -1 ? '무제한' : pkg.revisions + '회'} 수정</span>
                </div>
                <button class="btn btn-primary btn-select-package" data-package-id="${pkg.id}">
                    선택하기
                </button>
            </div>
        `).join('');
        
        // Package selection
        packagesGrid.querySelectorAll('.btn-select-package').forEach(btn => {
            btn.addEventListener('click', () => this.selectPackage(btn.dataset.packageId));
        });
        
        // Update package selector
        const packageSelect = this.modal.querySelector('.package-select');
        packageSelect.innerHTML = '<option value="">패키지를 선택하세요</option>' +
            packages.map(pkg => 
                `<option value="${pkg.id}">
                    ${pkg.name} - ₩${pkg.price.toLocaleString()}
                </option>`
            ).join('');
    }
    
    renderReviews(model) {
        // This would fetch and render actual reviews
        // For now, show placeholder
        const reviewsList = this.modal.querySelector('.reviews-list');
        reviewsList.innerHTML = '<p class="empty-state">아직 리뷰가 없습니다.</p>';
    }
    
    renderAbout(model) {
        this.modal.querySelector('.model-full-bio').innerHTML = 
            model.profile?.bio || '자세한 소개가 아직 작성되지 않았습니다.';
    }
    
    renderPortfolioPreview(model) {
        const preview = this.modal.querySelector('.portfolio-preview');
        const gallery = model.portfolio?.gallery || [];
        const previewItems = gallery.slice(0, 6);
        
        if (previewItems.length === 0) {
            preview.innerHTML = '<p>포트폴리오 준비 중</p>';
            return;
        }
        
        preview.innerHTML = `
            <div class="preview-grid">
                ${previewItems.map(item => `
                    <div class="preview-item">
                        <img src="${item.thumbnailUrl || item.url}" alt="${item.caption}" loading="lazy">
                    </div>
                `).join('')}
            </div>
            ${gallery.length > 6 ? 
                `<button class="btn-view-all" onclick="modelDetailModal.switchTab('portfolio')">
                    전체 보기 (${gallery.length}개)
                </button>` : ''
            }
        `;
    }
    
    switchTab(tabName) {
        // Update nav tabs
        this.modal.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content
        this.modal.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });
    }
    
    filterPortfolio(filter) {
        const items = this.modal.querySelectorAll('.portfolio-item');
        const buttons = this.modal.querySelectorAll('.filter-btn');
        
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        items.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    selectPackage(packageId) {
        if (!packageId || !this.currentModel) return;
        
        const pkg = this.currentModel.pricing?.packages?.find(p => p.id === packageId);
        if (!pkg) return;
        
        this.selectedPackage = pkg;
        
        // Update UI
        this.modal.querySelector('.package-select').value = packageId;
        this.modal.querySelector('.selected-price').textContent = `₩${pkg.price.toLocaleString()}`;
        
        // Highlight selected package
        this.modal.querySelectorAll('.package-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.packageId === packageId);
        });
    }
    
    handleContact() {
        if (!this.currentModel) return;
        
        // This would open a contact form or messaging system
        console.log('Contact model:', this.currentModel.id);
        if (window.showToast) {
            window.showToast('문의 기능은 준비 중입니다.', 'info');
        }
    }
    
    handleSave() {
        if (!this.currentModel) return;
        
        // This would save to favorites
        console.log('Save model:', this.currentModel.id);
        
        const btn = this.modal.querySelector('.btn-save');
        btn.classList.toggle('saved');
        btn.querySelector('.btn-icon').textContent = btn.classList.contains('saved') ? '♥' : '♡';
        
        if (window.showToast) {
            window.showToast(
                btn.classList.contains('saved') ? '저장되었습니다!' : '저장 취소되었습니다.',
                'success'
            );
        }
    }
    
    handleOrder() {
        if (!this.currentModel || !this.selectedPackage) {
            if (window.showToast) {
                window.showToast('패키지를 선택해주세요.', 'warning');
            }
            return;
        }
        
        // This would initiate the order process
        console.log('Order:', this.currentModel.id, this.selectedPackage.id);
        if (window.showToast) {
            window.showToast('주문 기능은 준비 중입니다.', 'info');
        }
    }
    
    trackView(modelId) {
        // Track profile view
        if (window.analytics) {
            window.analytics.track('Model Profile Viewed', {
                modelId: modelId
            });
        }
    }
    
    // Utility functions
    getSpecialtyName(specialty) {
        const names = {
            'fashion': '패션',
            'beauty': '뷰티',
            'lifestyle': '라이프스타일',
            'food': '푸드',
            'tech': '테크',
            'sports': '스포츠',
            'entertainment': '엔터테인먼트'
        };
        return names[specialty] || specialty;
    }
    
    getLanguageName(lang) {
        const names = {
            'ko': '한국어',
            'en': '영어',
            'ja': '일본어',
            'zh': '중국어',
            'es': '스페인어',
            'fr': '프랑스어'
        };
        return names[lang] || lang;
    }
    
    formatDate(dateString) {
        if (!dateString) return '최근';
        const date = new Date(dateString);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    }
}

// Create global instance
window.modelDetailModal = new ModelDetailModal();