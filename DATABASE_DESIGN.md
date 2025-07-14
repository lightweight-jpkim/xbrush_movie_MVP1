# xBrush MovieMaker Database Design

## 🎯 Overview
Complete database refactoring to support all features: model registration, showcase, admin management, and movie creation with proper data separation and relationships.

## 📋 Database Tables (Collections)

### 1. **users** (Customers/Clients)
Primary collection for all users of the platform.

```javascript
{
  userId: "user_123", // Primary Key
  email: "customer@email.com",
  name: "김철수",
  phone: "010-1234-5678",
  company: "ABC Company",
  role: "customer", // customer, model, admin
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp,
  status: "active", // active, suspended, deleted
  
  // Customer specific fields
  credits: 1000, // For video creation
  subscription: {
    plan: "premium",
    expiresAt: timestamp
  }
}
```

### 2. **models** (Model Basic Information)
Core model information and account data.

```javascript
{
  modelId: "model_123", // Primary Key
  userId: "user_456", // Foreign Key to users table
  
  // Basic Info
  name: "이영희",
  email: "model@email.com",
  phone: "010-9876-5432",
  birthDate: "1995-01-01",
  gender: "female",
  
  // KYC Verification
  kyc: {
    status: "verified", // pending, verified, rejected
    idNumber: "encrypted_950101-2******",
    idImageUrl: "storage/kyc/id_123.jpg",
    faceImageUrl: "storage/kyc/face_123.jpg",
    videoUrl: "storage/kyc/video_123.mp4",
    verifiedAt: timestamp,
    verifiedBy: "admin_userId"
  },
  
  // Status
  status: "active", // pending, active, inactive, suspended
  registrationStep: 6, // Current registration step
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. **modelProfiles** (Model Public/Showcase Information)
Public-facing information displayed on showcase page.

```javascript
{
  profileId: "profile_123", // Primary Key
  modelId: "model_123", // Foreign Key to models table
  
  // Display Information
  displayName: "모델 영희",
  tagline: "프로페셔널 광고 모델",
  introduction: "10년 경력의 전문 광고 모델입니다...",
  
  // Categories & Tags
  categories: ["beauty", "fashion", "lifestyle"],
  specialties: ["화장품", "패션", "푸드"],
  languages: ["korean", "english"],
  
  // Media
  profileImage: "storage/profiles/main_123.jpg",
  thumbnailImage: "storage/profiles/thumb_123.jpg",
  portfolioImages: [
    {
      url: "storage/portfolio/img1.jpg",
      caption: "화장품 광고",
      order: 1
    }
  ],
  videoReel: "storage/reels/reel_123.mp4",
  
  // Availability
  availability: {
    status: "available", // available, busy, vacation
    nextAvailableDate: "2024-02-01"
  },
  
  // Stats (for sorting/filtering)
  stats: {
    completedProjects: 156,
    averageRating: 4.8,
    responseTime: "1 hour",
    joinedDate: timestamp
  },
  
  isPublished: true,
  publishedAt: timestamp,
  updatedAt: timestamp
}
```

### 4. **modelPricing** (Pricing & Contract Terms)
Separate pricing information for flexibility.

```javascript
{
  pricingId: "price_123", // Primary Key
  modelId: "model_123", // Foreign Key to models table
  
  // Basic Pricing
  pricingType: "project", // hourly, project, monthly
  basePrice: 500000, // KRW
  currency: "KRW",
  
  // Detailed Pricing
  hourlyRate: 200000,
  halfDayRate: 800000,
  fullDayRate: 1500000,
  
  // Usage Rights Pricing
  usageRights: {
    online: {
      price: 0, // Included
      duration: "1년"
    },
    broadcast: {
      price: 1000000,
      duration: "6개월"
    },
    print: {
      price: 500000,
      duration: "1년"
    }
  },
  
  // Contract Terms
  minimumBooking: "4시간",
  cancellationPolicy: "촬영 3일 전까지 무료 취소",
  paymentTerms: "촬영 후 7일 이내",
  
  // Discounts
  discounts: [
    {
      type: "long_term",
      description: "3개월 이상 계약시",
      percentage: 10
    }
  ],
  
  effectiveFrom: timestamp,
  validUntil: timestamp,
  createdAt: timestamp
}
```

### 5. **reviews** (Customer Reviews)
Reviews from customers who worked with models.

```javascript
{
  reviewId: "review_123", // Primary Key
  modelId: "model_123", // Foreign Key to models table
  customerId: "user_789", // Foreign Key to users table
  projectId: "project_456", // Foreign Key to projects table
  
  rating: 5, // 1-5
  title: "최고의 모델입니다",
  content: "매우 프로페셔널하고 결과물이 훌륭했습니다...",
  
  // Detailed Ratings
  ratings: {
    professionalism: 5,
    communication: 5,
    quality: 5,
    punctuality: 5
  },
  
  // Response from model
  modelResponse: {
    content: "감사합니다!",
    respondedAt: timestamp
  },
  
  isVerified: true, // Verified purchase
  isPublished: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6. **projects** (Video Creation Projects)
Track all video creation projects.

```javascript
{
  projectId: "project_123", // Primary Key
  customerId: "user_789", // Foreign Key to users table
  modelId: "model_123", // Foreign Key to models table
  
  // Project Details
  projectName: "신제품 화장품 광고",
  projectType: "commercial",
  status: "completed", // draft, processing, completed, cancelled
  
  // Video Details
  videoSpecs: {
    format: "16:9",
    duration: "30s",
    style: "modern",
    targetAudience: "20-30대 여성"
  },
  
  // Content
  scenario: {
    scene1: "제품 소개...",
    scene2: "사용 장면...",
    scene3: "마무리..."
  },
  
  // Results
  outputs: [
    {
      version: "v1",
      videoUrl: "storage/videos/output_123_v1.mp4",
      thumbnailUrl: "storage/videos/thumb_123_v1.jpg",
      createdAt: timestamp
    }
  ],
  
  // Financial
  cost: {
    modelFee: 500000,
    platformFee: 50000,
    total: 550000
  },
  
  payment: {
    status: "paid", // pending, paid, refunded
    paidAt: timestamp,
    method: "card"
  },
  
  createdAt: timestamp,
  completedAt: timestamp
}
```

### 7. **modelApplications** (Model Registration Applications)
Track model registration process.

```javascript
{
  applicationId: "app_123", // Primary Key
  modelId: "model_123", // Foreign Key to models table
  
  // Application Status
  status: "pending", // pending, approved, rejected
  currentStep: 5,
  
  // Submitted Data (temporary storage during registration)
  submittedData: {
    step1: { ... },
    step2: { ... },
    // ... etc
  },
  
  // Admin Review
  review: {
    reviewedBy: "admin_userId",
    reviewedAt: timestamp,
    comments: "모든 서류 확인 완료",
    decision: "approved"
  },
  
  submittedAt: timestamp,
  updatedAt: timestamp
}
```

### 8. **transactions** (Financial Transactions)
Track all financial transactions.

```javascript
{
  transactionId: "txn_123", // Primary Key
  type: "project_payment", // project_payment, model_payout, credit_purchase
  
  // Related Entities
  projectId: "project_123",
  modelId: "model_123",
  customerId: "user_789",
  
  // Financial Details
  amount: 550000,
  currency: "KRW",
  
  // Breakdown
  breakdown: {
    modelFee: 500000,
    platformFee: 50000,
    tax: 0
  },
  
  // Payment Info
  paymentMethod: "card",
  paymentDetails: {
    // Encrypted payment info
  },
  
  status: "completed", // pending, completed, failed, refunded
  createdAt: timestamp,
  completedAt: timestamp
}
```

## 🔗 Relationships

### Primary Relationships:
1. **users** ← → **models** (1:1)
2. **models** ← → **modelProfiles** (1:1)
3. **models** ← → **modelPricing** (1:1)
4. **models** ← → **reviews** (1:many)
5. **models** ← → **projects** (1:many)
6. **users** ← → **projects** (1:many)
7. **projects** ← → **reviews** (1:1)
8. **models** ← → **modelApplications** (1:1)

## 🎯 Key Design Decisions

### 1. **Separation of Concerns**
- User authentication/account info separate from model info
- Public profile separate from private model data
- Pricing in its own table for easy updates
- Financial data isolated for security

### 2. **Performance Optimization**
- Indexed fields: userId, modelId, status, createdAt
- Denormalized stats in modelProfiles for fast queries
- Separate tables reduce document size

### 3. **Security Considerations**
- Sensitive data (KYC, payment) in separate collections
- Different access rules per collection
- Encrypted fields for PII

### 4. **Scalability**
- Horizontal scaling possible with sharding by userId
- Separate read/write patterns per table
- Caching friendly structure

## 📐 Firebase Security Rules Example

```javascript
// Models collection - private data
match /models/{modelId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.userId || 
     request.auth.token.role == 'admin');
  allow write: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}

// Model profiles - public data
match /modelProfiles/{profileId} {
  allow read: if resource.data.isPublished == true;
  allow write: if request.auth != null && 
    request.auth.uid == get(/databases/$(database)/documents/models/$(resource.data.modelId)).data.userId;
}

// Reviews - public but verified
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null && 
    exists(/databases/$(database)/documents/projects/$(request.resource.data.projectId)) &&
    get(/databases/$(database)/documents/projects/$(request.resource.data.projectId)).data.customerId == request.auth.uid;
  allow update: if request.auth != null && 
    request.auth.uid == resource.data.customerId;
}
```

## 🚀 Migration Strategy

### Phase 1: Create New Structure
1. Create all new collections
2. Set up security rules
3. Update code to write to both old and new

### Phase 2: Data Migration
1. Script to migrate existing data
2. Split current model data into appropriate tables
3. Generate missing IDs and relationships

### Phase 3: Code Update
1. Update all queries to use new structure
2. Update admin panel
3. Update model registration flow

### Phase 4: Cleanup
1. Remove old collection references
2. Delete migrated data from old structure
3. Update all documentation

## 💡 Benefits of This Structure

1. **Better Performance**: Smaller documents, targeted queries
2. **Easier Maintenance**: Clear separation of concerns
3. **Enhanced Security**: Granular access control
4. **Scalability**: Ready for growth
5. **Flexibility**: Easy to add new features
6. **Analytics Ready**: Clean data for reporting

## 📊 Query Examples

### Get Model Showcase Data
```javascript
// Get public model profiles with pricing
const profile = await db.collection('modelProfiles')
  .where('isPublished', '==', true)
  .where('categories', 'array-contains', 'beauty')
  .get();

const pricing = await db.collection('modelPricing')
  .doc(profile.modelId)
  .get();
```

### Get Model Full Data (Admin)
```javascript
// Get all model data for admin
const model = await db.collection('models').doc(modelId).get();
const profile = await db.collection('modelProfiles')
  .where('modelId', '==', modelId).get();
const pricing = await db.collection('modelPricing')
  .where('modelId', '==', modelId).get();
const reviews = await db.collection('reviews')
  .where('modelId', '==', modelId).get();
```

### Create New Project
```javascript
// Create project with proper relationships
const project = {
  projectId: generateId(),
  customerId: currentUser.uid,
  modelId: selectedModel.id,
  // ... other fields
};

await db.collection('projects').doc(project.projectId).set(project);
```