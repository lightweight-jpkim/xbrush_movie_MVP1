# Model Licensing Plans Storage Structure

## Where to Store Model's Custom Licensing Plans

### Option 1: Embedded in Model Profile (Current Approach - NOT IDEAL)
```javascript
// In models collection
{
  modelId: "model_001",
  personalInfo: {...},
  licensingPlans: {...}  // ❌ Makes model document too large
}
```

### Option 2: Separate Collection (RECOMMENDED) ✅

## Recommended Structure: `modelLicensingPlans` Collection

```javascript
// Collection: modelLicensingPlans
{
  planId: "plan_model001_online_basic",
  modelId: "model_001",
  planType: "online_basic",  // References platform template
  
  // Basic Settings
  settings: {
    enabled: true,
    displayOrder: 1,
    customName: "채연의 SNS 스타터 패키지",  // Optional custom name
    customDescription: "신규 브랜드를 위한 특별 가격"
  },
  
  // Pricing Configuration
  pricing: {
    basePrice: 300000,
    currency: "KRW",
    
    // Price validity period (for promotions)
    validFrom: "2024-01-01",
    validUntil: null,  // null = no expiration
    
    // Promotional pricing
    promotionalPrice: 250000,
    promotionEnds: "2024-03-31"
  },
  
  // Customizable Options
  options: {
    duration: {
      min: 3,  // months
      max: 12,
      default: 6,
      unit: "months"
    },
    territory: {
      available: ["domestic", "asia", "global"],
      default: "domestic",
      pricing: {  // Additional cost for territories
        "domestic": 1.0,
        "asia": 1.3,
        "global": 1.5
      }
    },
    usage: {
      channels: ["sns", "website", "youtube"],
      restrictions: "No adult content, No political use"
    },
    delivery: {
      standard: 5,  // days
      express: 3,
      rush: 1
    },
    revisions: {
      included: 2,
      additional: 50000  // per revision
    }
  },
  
  // Dynamic Pricing Rules
  dynamicPricing: {
    rushDelivery: {
      enabled: true,
      multipliers: {
        "24h": 2.0,
        "48h": 1.5,
        "72h": 1.2
      }
    },
    bulkDiscount: {
      enabled: true,
      tiers: [
        { min: 3, discount: 0.1 },
        { min: 5, discount: 0.15 },
        { min: 10, discount: 0.2 }
      ]
    },
    seasonalPricing: {
      enabled: false,
      rules: []
    }
  },
  
  // Approval Status (Admin Review)
  approval: {
    status: "approved",  // pending, approved, rejected, revision_needed
    reviewedBy: "admin_001",
    reviewedAt: "2024-01-15T10:30:00Z",
    reviewNotes: "Approved - reasonable pricing",
    
    // Auto-flagged issues
    flags: {
      priceTooLow: false,  // Below 50% of market
      priceTooHigh: false,  // Above 300% of market
      inappropriateTerms: false,
      missingRequiredInfo: false
    }
  },
  
  // Performance Metrics
  metrics: {
    views: 156,
    inquiries: 23,
    purchases: 12,
    conversionRate: 0.077,
    avgRating: 4.8,
    revenue: 3600000
  },
  
  // Metadata
  createdAt: "2024-01-01T09:00:00Z",
  updatedAt: "2024-02-15T14:30:00Z",
  lastModifiedBy: "model_001",
  version: 3,  // Track changes
  
  // A/B Testing
  experimentGroup: null,  // For pricing experiments
  
  isActive: true,
  isDeleted: false
}
```

## Validation Rules for Inappropriate Plans

### 1. **Automatic Validation (System)**

```javascript
class LicensingPlanValidator {
  validate(plan) {
    const errors = [];
    const warnings = [];
    
    // Price Validation
    const marketAvg = this.getMarketAverage(plan.planType);
    
    if (plan.pricing.basePrice < marketAvg * 0.3) {
      errors.push({
        code: 'PRICE_TOO_LOW',
        message: 'Price is below 30% of market average',
        severity: 'error'
      });
    }
    
    if (plan.pricing.basePrice > marketAvg * 5) {
      warnings.push({
        code: 'PRICE_VERY_HIGH',
        message: 'Price is 5x above market average',
        severity: 'warning'
      });
    }
    
    // Content Validation
    const inappropriate = this.checkInappropriateContent(plan);
    if (inappropriate.found) {
      errors.push({
        code: 'INAPPROPRIATE_CONTENT',
        message: inappropriate.reason,
        severity: 'error'
      });
    }
    
    // Completeness Check
    if (!plan.options.duration.min || !plan.options.duration.max) {
      errors.push({
        code: 'MISSING_DURATION',
        message: 'Duration limits are required',
        severity: 'error'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      requiresReview: warnings.length > 0
    };
  }
  
  checkInappropriateContent(plan) {
    const bannedWords = ['illegal', 'adult', 'gambling'];
    const description = plan.customDescription?.toLowerCase() || '';
    
    for (const word of bannedWords) {
      if (description.includes(word)) {
        return {
          found: true,
          reason: `Contains restricted term: ${word}`
        };
      }
    }
    
    return { found: false };
  }
}
```

### 2. **Admin Review Queue**

```javascript
// Collection: planReviewQueue
{
  reviewId: "review_001",
  planId: "plan_model001_online_basic",
  modelId: "model_001",
  
  triggerReason: [
    "Price 80% below market average",
    "New model's first plan",
    "Custom package with unusual terms"
  ],
  
  priority: "high",  // high, medium, low
  status: "pending",  // pending, reviewing, approved, rejected
  
  assignedTo: null,
  createdAt: "2024-02-15T10:00:00Z",
  dueBy: "2024-02-16T10:00:00Z"
}
```

## Storage Strategy

### 1. **Main Collections Structure**

```
Firebase Firestore:
├── models (existing)
│   └── {modelId}
│       └── (basic info only)
│
├── modelLicensingPlans (NEW)
│   └── {planId}
│       └── (full plan details)
│
├── planTemplates (Platform managed)
│   └── {templateId}
│       └── (base templates)
│
└── planReviewQueue (Admin workflow)
    └── {reviewId}
        └── (plans needing review)
```

### 2. **Indexes for Efficient Queries**

```javascript
// Composite indexes needed:
- modelId + planType + isActive
- modelId + approval.status
- planType + pricing.basePrice
- approval.status + createdAt
```

### 3. **Security Rules**

```javascript
// Firestore Security Rules
match /modelLicensingPlans/{planId} {
  // Public can read approved, active plans
  allow read: if resource.data.approval.status == 'approved' 
              && resource.data.isActive == true;
  
  // Model can read all their plans
  allow read: if request.auth.uid == resource.data.modelId;
  
  // Model can create/update their own plans
  allow create: if request.auth.uid == request.resource.data.modelId
                && validatePlan(request.resource.data);
  
  allow update: if request.auth.uid == resource.data.modelId
                && validatePlan(request.resource.data)
                && resource.data.approval.status != 'approved'; // Can't edit approved plans
  
  // Only admin can approve/reject
  allow update: if request.auth.token.admin == true
                && onlyApprovalChanged();
}

function validatePlan(plan) {
  return plan.pricing.basePrice > 0
      && plan.pricing.basePrice < 100000000  // Max 100M KRW
      && plan.planType in ['online_basic', 'online_premium', 'broadcast', 'print', 'full_commercial'];
}
```

## Admin Review Interface

```javascript
// Admin Dashboard Component
<PlanReviewDashboard>
  <ReviewQueue>
    <FilterBar>
      <StatusFilter /> // Pending, Approved, Rejected
      <PriorityFilter /> // High, Medium, Low
      <ModelFilter /> // By model name
    </FilterBar>
    
    <PlanReviewCard>
      <ModelInfo />
      <PlanDetails />
      <FlaggedIssues>
        - Price 80% below market
        - New model
        - Rush delivery 3x multiplier
      </FlaggedIssues>
      
      <MarketComparison>
        <Chart /> // Shows where this price sits
        <SimilarPlans /> // What others charge
      </MarketComparison>
      
      <ReviewActions>
        <ApproveButton />
        <RejectButton />
        <RequestRevisionButton />
        <AddNoteButton />
      </ReviewActions>
    </PlanReviewCard>
  </ReviewQueue>
  
  <Analytics>
    <ApprovalRate />
    <CommonRejectionReasons />
    <PriceDistribution />
  </Analytics>
</PlanReviewDashboard>
```

## Benefits of This Structure

1. **Scalability**: Plans in separate collection prevents model documents from growing too large
2. **Flexibility**: Easy to add new plan types or options
3. **Auditability**: Version tracking and change history
4. **Performance**: Indexed queries for fast retrieval
5. **Safety**: Admin review for inappropriate content
6. **Analytics**: Built-in metrics tracking

## Implementation Priority

1. Create `modelLicensingPlans` collection structure
2. Build plan creation/edit interface for models
3. Implement validation rules
4. Create admin review dashboard
5. Add analytics and reporting