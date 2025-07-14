# Database Integration Plan - xBrush Face Licensing Platform

## Current State vs Target Schema

### ✅ Implemented:
1. **models** collection (combining models + modelProfiles)
   - Basic info + public profile in one collection
   - Premium tier system added
   - Firebase Storage for images

### ❌ Not Implemented (Need to Add):

#### 1. **licensingPlans** Collection
```javascript
{
  planId: "plan_001",
  modelId: "model_001",
  planName: "온라인 베이직",
  usageScope: "온라인 광고",
  duration: "6개월",
  territory: "국내",
  basePrice: 300000,
  platformFeePercent: 20,
  restrictions: "SNS, 웹사이트",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. **licenses** Collection  
```javascript
{
  licenseId: "lic_001",
  projectId: "proj_001",
  modelId: "model_001",
  planId: "plan_001",
  licenseNumber: "XB-2024-0215-001",
  customerEmail: "customer@company.com",
  customerCompany: "ABC화장품",
  usageDetails: "신제품 런칭 캠페인",
  startDate: "2024-02-15",
  endDate: "2024-08-15",
  totalAmount: 300000,
  status: "active", // active, expired, cancelled
  createdAt: timestamp
}
```

#### 3. **projects** Collection
```javascript
{
  projectId: "proj_001",
  customerEmail: "customer@abc.com",
  modelId: "model_001",
  projectName: "봄 신제품 화장품",
  videoSpecs: {
    aspectRatio: "16:9",
    duration: 30,
    style: "modern"
  },
  scenario: {
    scene1: "제품소개",
    scene2: "사용장면", 
    scene3: "마무리"
  },
  status: "completed", // draft, processing, completed
  videoUrl: "storage/videos/proj_001.mp4",
  createdAt: timestamp,
  completedAt: timestamp
}
```

#### 4. **reviews** Collection
```javascript
{
  reviewId: "review_001",
  licenseId: "lic_001",
  modelId: "model_001", 
  projectId: "proj_001",
  customerEmail: "customer@abc.com",
  rating: 5,
  title: "완벽한 광고 영상",
  content: "브랜드 이미지와 잘 맞았습니다",
  videoQuality: 5,
  likeness: 5,
  satisfaction: 5,
  createdAt: timestamp,
  helpful: 0,
  verified: true
}
```

#### 5. **payments** Collection
```javascript
{
  paymentId: "pay_001",
  licenseId: "lic_001",
  type: "license_purchase",
  totalAmount: 300000,
  modelShare: 240000,
  platformFee: 60000,
  paymentMethod: "card",
  status: "settled", // pending, completed, settled, refunded
  paidAt: timestamp,
  settledAt: timestamp,
  settlementBatch: "2024-02-25",
  stripePaymentId: "pi_xxx"
}
```

## Implementation Steps:

### Phase 1: Database Structure (Current Focus)
1. ✅ Unify existing pages to use modelStorageAdapter
2. ⬜ Create Firestore collections for missing tables
3. ⬜ Set up Firebase Security Rules for each collection
4. ⬜ Create service classes for each collection

### Phase 2: Core Features
1. ⬜ Implement Licensing Plans management
2. ⬜ Build Project creation flow
3. ⬜ Implement License purchase system
4. ⬜ Add Review system

### Phase 3: Financial System
1. ⬜ Payment processing integration
2. ⬜ Settlement calculations
3. ⬜ Payout management

### Phase 4: Admin Tools
1. ⬜ License management dashboard
2. ⬜ Financial reporting
3. ⬜ Model earnings tracking

## Firebase Security Rules Needed:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Models - Public read, admin write
    match /models/{modelId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Licensing Plans - Public read, model owner write
    match /licensingPlans/{planId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.modelId || 
         request.auth.token.admin == true);
    }
    
    // Licenses - Private, only stakeholders can access
    match /licenses/{licenseId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.customerEmail ||
         request.auth.uid == resource.data.modelId ||
         request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth.token.admin == true;
    }
    
    // Projects - Similar to licenses
    match /projects/{projectId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.customerEmail ||
         request.auth.uid == resource.data.modelId ||
         request.auth.token.admin == true);
      allow write: if request.auth != null;
    }
    
    // Reviews - Public read, verified customers write
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/licenses/$(resource.data.licenseId));
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.customerEmail;
    }
    
    // Payments - Private, only admin and stakeholders
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
        (request.auth.token.admin == true ||
         request.auth.uid == get(/databases/$(database)/documents/licenses/$(resource.data.licenseId)).data.modelId);
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

## Next Steps:

1. **Create Service Classes** for each collection:
   - `LicensingPlanService`
   - `LicenseService`
   - `ProjectService`
   - `ReviewService`
   - `PaymentService`

2. **Update Existing Code**:
   - Modify video creation flow to create projects
   - Add license purchase before video generation
   - Implement review system after project completion

3. **Build Admin Interfaces**:
   - License management
   - Payment tracking
   - Model earnings dashboard

## Migration Considerations:

- Keep current `models` collection as is (no breaking changes)
- New collections can be added incrementally
- Each phase can be deployed independently
- Backward compatibility maintained throughout