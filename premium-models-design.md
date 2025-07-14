# Premium Models Feature Design

## Overview
Add a premium tier system for models to give them better visibility and placement across the platform.

## Database Updates

### 1. Update modelProfiles table
Add these fields to the existing modelProfiles table:

```javascript
{
  // Existing fields...
  
  // Premium Status Fields
  tier: "premium", // "basic", "premium", "vip"
  premiumBadge: "⭐ 프리미엄 모델", // Custom badge text
  premiumStartDate: "2024-01-15",
  premiumEndDate: "2025-01-15", // For subscription-based premium
  premiumFeatures: {
    priorityPlacement: true,
    highlightedCard: true,
    customBadge: true,
    featuredRotation: true, // Appears in hero sections
    enhancedProfile: true, // More media slots, etc.
    analyticsAccess: true
  },
  sortPriority: 1000, // Higher number = higher placement
  
  // Premium-specific media
  premiumVideo: "storage/premium/intro_video_123.mp4", // Intro video
  premiumGallery: [ // Additional showcase images
    "storage/premium/gallery1.jpg",
    "storage/premium/gallery2.jpg"
  ]
}
```

### 2. Add premiumHistory table (optional)
Track premium status changes:

```javascript
{
  historyId: "hist_001",
  modelId: "model_001",
  action: "upgraded", // "upgraded", "downgraded", "renewed"
  fromTier: "basic",
  toTier: "premium",
  reason: "Admin promotion",
  adminId: "admin_001",
  effectiveDate: "2024-01-15",
  expiryDate: "2025-01-15",
  price: 0, // If paid upgrade
  notes: "High performance model",
  createdAt: timestamp
}
```

## Frontend Implementation

### 1. Model Showcase Page Update

```javascript
// models.js - Update the model loading function
async function loadModels() {
    const modelGrid = document.getElementById('modelGrid');
    
    try {
        const models = await window.modelStorageAdapter.getActiveModels();
        
        // Separate premium and regular models
        const premiumModels = models.filter(m => m.tier === 'premium' || m.tier === 'vip');
        const regularModels = models.filter(m => !m.tier || m.tier === 'basic');
        
        // Sort each group by sortPriority and rating
        premiumModels.sort((a, b) => (b.sortPriority || 0) - (a.sortPriority || 0));
        regularModels.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        let html = '';
        
        // Premium Models Section
        if (premiumModels.length > 0) {
            html += `
                <div class="premium-section">
                    <div class="section-header premium-header">
                        <h2>⭐ 프리미엄 모델</h2>
                        <span class="premium-count">${premiumModels.length}명의 프리미엄 모델</span>
                    </div>
                    <div class="model-grid premium-grid">
                        ${premiumModels.map(model => createPremiumModelCard(model)).join('')}
                    </div>
                </div>
                <div class="section-divider"></div>
            `;
        }
        
        // Regular Models Section
        html += `
            <div class="regular-section">
                <div class="section-header">
                    <h2>등록된 모델</h2>
                    <span class="model-count">${regularModels.length}명의 모델</span>
                </div>
                <div class="model-grid">
                    ${regularModels.map(model => createModelCard(model)).join('')}
                </div>
            </div>
        `;
        
        modelGrid.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

function createPremiumModelCard(model) {
    return `
        <div class="model-card premium-model-card" onclick="viewModel('${model.modelId}')">
            <div class="premium-badge">${model.premiumBadge || '⭐ 프리미엄'}</div>
            <div class="model-image premium-image">
                <img src="${model.profileImage}" alt="${model.displayName}">
                ${model.premiumVideo ? `
                    <div class="video-preview-icon">
                        <svg><!-- Play icon --></svg>
                    </div>
                ` : ''}
            </div>
            <div class="model-info premium-info">
                <h3>${model.displayName}</h3>
                <p class="tagline">${model.tagline}</p>
                <div class="model-stats">
                    ${model.rating > 0 ? `<span class="rating">⭐ ${model.rating.toFixed(1)}</span>` : ''}
                    <span class="licenses">${model.totalLicenses}건</span>
                </div>
                <div class="premium-features">
                    <span class="feature-tag">빠른 응답</span>
                    <span class="feature-tag">검증된 프로필</span>
                </div>
            </div>
        </div>
    `;
}
```

### 2. Movie Making Page Update (Step 1)

```javascript
// app.js - Update the actor selection in Step 1
function loadStep1() {
    const container = document.getElementById('step1-content');
    
    container.innerHTML = `
        <!-- Premium Models Section -->
        <div class="premium-models-section">
            <div class="section-header">
                <h3>⭐ 프리미엄 모델</h3>
                <p class="section-subtitle">검증된 최고의 모델들을 만나보세요</p>
            </div>
            <div class="premium-models-carousel" id="premiumModelsCarousel">
                <!-- Premium models will be loaded here -->
            </div>
        </div>
        
        <!-- Standard Models Section -->
        <div class="standard-models-section">
            <div class="section-header">
                <h3>일반 모델</h3>
                <button class="view-all-btn" onclick="window.location.href='models.html'">
                    모든 모델 보기
                </button>
            </div>
            <div class="model-grid" id="standardModelsGrid">
                <!-- Standard models will be loaded here -->
            </div>
        </div>
        
        <!-- AI Models Section (Future) -->
        <div class="ai-models-section" style="display: none;">
            <div class="section-header">
                <h3>AI 생성 모델</h3>
                <p class="section-subtitle">곧 출시 예정</p>
            </div>
        </div>
    `;
    
    loadPremiumModels();
    loadStandardModels();
}

async function loadPremiumModels() {
    const carousel = document.getElementById('premiumModelsCarousel');
    
    try {
        const models = await window.modelStorageAdapter.getPremiumModels(10);
        
        carousel.innerHTML = models.map(model => `
            <div class="premium-model-slide">
                <div class="premium-model-card large" onclick="selectModel('${model.modelId}')">
                    <div class="premium-indicator">
                        <span class="premium-badge">⭐ PREMIUM</span>
                        ${model.rating >= 4.5 ? '<span class="top-rated">TOP RATED</span>' : ''}
                    </div>
                    <div class="model-visual">
                        <img src="${model.profileImage}" alt="${model.displayName}">
                        ${model.premiumVideo ? `
                            <button class="preview-video-btn" onclick="event.stopPropagation(); previewVideo('${model.premiumVideo}')">
                                <svg><!-- Play icon --></svg>
                                미리보기
                            </button>
                        ` : ''}
                    </div>
                    <div class="model-details">
                        <h4>${model.displayName}</h4>
                        <p class="premium-tagline">${model.tagline}</p>
                        <div class="model-highlights">
                            <span>📊 ${model.totalLicenses}+ 프로젝트</span>
                            <span>⭐ ${model.rating || 'New'}</span>
                            <span>⚡ ${model.responseTime || '1시간 내'}</span>
                        </div>
                        <div class="price-preview">
                            <span class="from-price">₩${model.lowestPrice.toLocaleString()}부터</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Initialize carousel functionality
        initializePremiumCarousel();
        
    } catch (error) {
        console.error('Error loading premium models:', error);
    }
}
```

### 3. CSS Styling for Premium Models

```css
/* premium-models.css */

/* Premium Section Headers */
.premium-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.premium-header h2 {
    font-size: 1.5em;
    margin: 0;
}

/* Premium Model Cards */
.premium-model-card {
    position: relative;
    border: 2px solid #667eea;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

.premium-model-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.premium-model-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.2);
}

.premium-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8em;
    font-weight: 600;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Premium Features Tags */
.premium-features {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    flex-wrap: wrap;
}

.feature-tag {
    background: #f0f4ff;
    color: #667eea;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: 500;
}

/* Premium Carousel */
.premium-models-carousel {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding: 20px 0;
    scroll-behavior: smooth;
}

.premium-model-slide {
    flex: 0 0 300px;
}

.premium-model-card.large {
    height: 400px;
    display: flex;
    flex-direction: column;
}

.premium-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
    z-index: 10;
}

.top-rated {
    background: #ff6b6b;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7em;
    font-weight: 600;
}

/* Section Divider */
.section-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    margin: 40px 0;
}

/* Premium Video Preview */
.preview-video-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85em;
    transition: background 0.3s ease;
}

.preview-video-btn:hover {
    background: rgba(0,0,0,0.9);
}
```

### 4. Admin Panel for Managing Premium Status

```javascript
// admin-premium-management.js
async function togglePremiumStatus(modelId) {
    const model = await getModelDetails(modelId);
    const currentTier = model.tier || 'basic';
    
    const modal = createPremiumModal(model, currentTier);
    document.body.appendChild(modal);
}

function createPremiumModal(model, currentTier) {
    const modal = document.createElement('div');
    modal.className = 'premium-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Premium Status Management</h3>
            <p>Model: ${model.displayName}</p>
            <p>Current Tier: ${currentTier}</p>
            
            <form id="premiumForm">
                <label>
                    New Tier:
                    <select name="tier">
                        <option value="basic" ${currentTier === 'basic' ? 'selected' : ''}>Basic</option>
                        <option value="premium" ${currentTier === 'premium' ? 'selected' : ''}>Premium</option>
                        <option value="vip" ${currentTier === 'vip' ? 'selected' : ''}>VIP</option>
                    </select>
                </label>
                
                <label>
                    Duration:
                    <select name="duration">
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                        <option value="0">Permanent</option>
                    </select>
                </label>
                
                <label>
                    Custom Badge Text:
                    <input type="text" name="badgeText" placeholder="⭐ 프리미엄 모델">
                </label>
                
                <label>
                    Sort Priority (higher = top):
                    <input type="number" name="sortPriority" value="1000" min="0" max="9999">
                </label>
                
                <label>
                    Notes:
                    <textarea name="notes" placeholder="Reason for status change"></textarea>
                </label>
                
                <div class="modal-buttons">
                    <button type="submit">Update Status</button>
                    <button type="button" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    modal.querySelector('#premiumForm').onsubmit = async (e) => {
        e.preventDefault();
        await updatePremiumStatus(model.modelId, new FormData(e.target));
        closeModal();
    };
    
    return modal;
}
```

## Model Storage Adapter Update

```javascript
// Add these methods to ModelStorageAdapterV2
class ModelStorageAdapterV2 {
    // ... existing methods ...
    
    async getPremiumModels(limit = 10) {
        const q = query(
            collection(db, this.collections.profiles),
            where('isActive', '==', true),
            where('tier', 'in', ['premium', 'vip']),
            orderBy('sortPriority', 'desc'),
            orderBy('rating', 'desc'),
            limit(limit)
        );
        
        const snapshot = await getDocs(q);
        const models = [];
        
        for (const doc of snapshot.docs) {
            const profile = doc.data();
            // Get pricing plans
            const plansQuery = query(
                collection(db, this.collections.plans),
                where('modelId', '==', profile.modelId),
                where('isActive', '==', true)
            );
            
            const plansSnapshot = await getDocs(plansQuery);
            const plans = plansSnapshot.docs.map(doc => doc.data());
            
            models.push({
                ...profile,
                plans: plans,
                lowestPrice: Math.min(...plans.map(p => p.basePrice))
            });
        }
        
        return models;
    }
    
    async updateModelTier(modelId, tierData) {
        const profileQuery = query(
            collection(db, this.collections.profiles),
            where('modelId', '==', modelId)
        );
        
        const snapshot = await getDocs(profileQuery);
        if (snapshot.empty) {
            throw new Error('Model profile not found');
        }
        
        const profileDoc = snapshot.docs[0];
        const updateData = {
            tier: tierData.tier,
            premiumBadge: tierData.badgeText || this.getDefaultBadge(tierData.tier),
            premiumStartDate: new Date(),
            premiumEndDate: tierData.duration > 0 
                ? new Date(Date.now() + tierData.duration * 30 * 24 * 60 * 60 * 1000)
                : null,
            sortPriority: parseInt(tierData.sortPriority) || 1000,
            updatedAt: new Date()
        };
        
        await updateDoc(profileDoc.ref, updateData);
        
        // Log the change
        await this.logPremiumChange(modelId, tierData);
        
        return true;
    }
    
    getDefaultBadge(tier) {
        const badges = {
            premium: '⭐ 프리미엄 모델',
            vip: '💎 VIP 모델',
            basic: ''
        };
        return badges[tier] || '';
    }
}
```

## Benefits of Premium Tier System

1. **Revenue Generation**: Premium subscriptions for models
2. **Quality Control**: Highlight best performers
3. **Better UX**: Users find top models quickly
4. **Incentive System**: Models work harder to achieve premium status
5. **Flexible Pricing**: Premium models can charge higher rates

## Premium Tier Features

### Basic Tier (Default)
- Standard placement
- Basic profile features
- Standard search visibility

### Premium Tier
- Top placement in showcase
- Featured in movie maker
- Premium badge
- Enhanced profile (more media)
- Priority in search results
- Monthly analytics report

### VIP Tier (Future)
- Everything in Premium
- Homepage hero section
- Custom profile design
- Dedicated account manager
- Advanced analytics
- Marketing support

This system provides flexibility for admins to promote high-quality models while creating a revenue stream through premium subscriptions.