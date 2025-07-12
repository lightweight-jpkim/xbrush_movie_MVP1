# xBrush Model Marketplace Design Document

## Database Schema Enhancement

### 1. Model Profile (Enhanced)
```javascript
{
  // Basic Info (existing)
  id: string,
  personalInfo: {...},
  
  // Professional Profile
  profile: {
    tagline: string,              // "전문 패션 모델 | 10년 경력"
    bio: string,                  // Detailed introduction
    specialties: string[],        // ["fashion", "beauty", "lifestyle"]
    languages: string[],          // ["ko", "en", "ja"]
    experience: string,           // "10+ years"
    verificationStatus: {
      identity: boolean,          // KYC verified
      professional: boolean,      // Portfolio verified
      premium: boolean           // Premium member
    }
  },
  
  // Portfolio & Media
  portfolio: {
    thumbnailUrl: string,
    coverImageUrl: string,        // Hero banner image
    gallery: [{
      id: string,
      url: string,
      type: 'image' | 'video',
      caption: string,
      tags: string[]
    }],
    showcaseVideo: string,        // Introduction video URL
    referenceWorks: [{            // Previous commercial works
      title: string,
      client: string,
      mediaUrl: string,
      description: string
    }]
  },
  
  // Pricing & Packages
  pricing: {
    currency: 'KRW',
    packages: [{
      id: string,
      name: string,               // "Basic", "Standard", "Premium"
      price: number,
      description: string,
      deliveryTime: number,       // days
      revisions: number,
      features: string[],
      popular: boolean
    }],
    customQuote: boolean
  },
  
  // Stats & Social Proof
  stats: {
    completedProjects: number,
    responseTime: number,         // hours
    repeatClients: number,
    satisfactionRate: number,     // percentage
    totalEarnings: number,
    joinedDate: timestamp
  },
  
  // Reviews & Ratings
  ratings: {
    overall: number,              // 1-5
    communication: number,
    quality: number,
    delivery: number,
    value: number,
    totalReviews: number
  },
  
  // Availability
  availability: {
    status: 'available' | 'busy' | 'vacation',
    nextAvailable: date,
    bookingCalendar: [...],
    timezone: string
  },
  
  // Commercial Terms
  commercialTerms: {
    usageRights: [...],           // Detailed rights
    restrictions: [...],          // What's not allowed
    extraFees: [...],            // Rush delivery, etc.
    cancellationPolicy: string
  }
}
```

### 2. Reviews Collection
```javascript
{
  id: string,
  modelId: string,
  clientId: string,
  projectId: string,
  rating: {
    overall: number,
    communication: number,
    quality: number,
    delivery: number,
    value: number
  },
  review: string,
  images: string[],               // Result images
  response: string,               // Model's response
  helpful: number,                // Helpful votes
  verified: boolean,
  createdAt: timestamp
}
```

### 3. Projects/Orders Collection
```javascript
{
  id: string,
  modelId: string,
  clientId: string,
  package: object,
  status: 'inquiry' | 'negotiating' | 'active' | 'completed' | 'cancelled',
  timeline: {
    inquiredAt: timestamp,
    startedAt: timestamp,
    completedAt: timestamp
  },
  deliverables: [...],
  messages: [...],
  payment: {
    amount: number,
    status: string,
    method: string
  }
}
```

## Page Features to Add

### 1. Model Profile Pop-up/Page
- **Hero Section**: Cover image with verified badges
- **Video Introduction**: 30-60 second intro video
- **About Section**: Detailed bio, experience, specialties
- **Portfolio Gallery**: Filterable by category
- **Pricing Packages**: Clear comparison table
- **Reviews Section**: With filters and sorting
- **FAQ**: Model-specific Q&A
- **Contact/Book Button**: Prominent CTA

### 2. Enhanced Model Cards
```
[Model Image]
[Verified Badge] [Online Status]
Model Name ⭐ 4.9 (127 reviews)
"전문 뷰티 모델 | 5년 경력"
₩100,000부터
[Quick View] [Save] [Contact]
```

### 3. Advanced Filtering & Search
- **By Specialty**: Fashion, Beauty, Food, Tech, etc.
- **By Price Range**: Budget filters
- **By Availability**: Available now, This week, etc.
- **By Rating**: 4+ stars, Top rated
- **By Location**: Region-based
- **By Language**: Korean, English, etc.
- **By Features**: Verified only, Video samples, etc.

### 4. Comparison Feature
- Compare up to 3 models side-by-side
- Compare: Pricing, Features, Stats, Reviews

### 5. Booking System
- **Inquiry Form**: Project details, timeline, budget
- **Calendar Integration**: See availability
- **Package Selection**: Choose or request custom
- **Secure Messaging**: In-app communication
- **File Sharing**: Share references, briefs

### 6. Social Proof Elements
- **Success Stories**: Featured projects
- **Client Testimonials**: Video testimonials
- **Trust Badges**: Verified, Premium, Top Rated
- **Activity Feed**: "Model X just completed a project"
- **Popular Models**: Trending this week

### 7. Analytics Dashboard (for models)
- Profile views
- Inquiry conversion rate
- Earnings analytics
- Client demographics
- Performance metrics

### 8. Additional Features
- **Wishlist/Favorites**: Save models for later
- **Similar Models**: AI-powered recommendations
- **Quick Preview**: Hover to see mini-portfolio
- **Share Profile**: Social media integration
- **Download Portfolio**: PDF export option

## Implementation Priority

### Phase 1 (MVP Enhancement)
1. ✅ Basic model profiles (done)
2. 🔄 Enhanced profile data structure
3. 🔄 Model detail pop-up/page
4. 🔄 Basic filtering and search
5. 🔄 Simple review system

### Phase 2 (Commercial Features)
1. Pricing packages
2. Booking/inquiry system
3. Reviews & ratings
4. Availability calendar
5. Basic analytics

### Phase 3 (Advanced Features)
1. Comparison tool
2. Advanced search/filters
3. Messaging system
4. Payment integration
5. Full analytics dashboard

## Technical Considerations

### Frontend
- React/Vue for dynamic UI
- Modal/drawer for model details
- Lazy loading for images/videos
- Responsive grid layout
- Smooth animations

### Backend (Firebase)
- Firestore for data
- Cloud Functions for business logic
- Cloud Storage for media
- Authentication for users
- Realtime updates

### Performance
- Image optimization (WebP, lazy loading)
- CDN for media delivery
- Caching strategies
- Pagination for large lists
- Search indexing

Would you like me to start implementing Phase 1 enhancements?