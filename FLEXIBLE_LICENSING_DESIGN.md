# Flexible Licensing System Design

## Current Problem
- Static licensing plans that apply to everyone
- Models can't set their own prices based on reputation
- No flexibility for experienced vs new models

## Proposed Solution: Model-Controlled Pricing

### 1. **Base Licensing Types** (Platform Defines)
Platform provides licensing TYPE templates that models customize:

```javascript
const LICENSE_TYPES = {
  online_basic: {
    id: "online_basic",
    name: "온라인 베이직",
    defaultScope: "SNS, 웹사이트",
    defaultDuration: "6개월",
    defaultTerritory: "국내",
    allowedCustomizations: ["price", "duration", "territory"]
  },
  online_premium: {
    id: "online_premium", 
    name: "온라인 프리미엄",
    defaultScope: "모든 온라인 채널",
    defaultDuration: "12개월",
    defaultTerritory: "전세계",
    allowedCustomizations: ["price", "duration", "territory", "scope"]
  },
  broadcast: {
    id: "broadcast",
    name: "방송 광고",
    defaultScope: "TV, 케이블",
    defaultDuration: "3개월",
    defaultTerritory: "국내",
    allowedCustomizations: ["price", "duration", "channels"]
  },
  print: {
    id: "print",
    name: "인쇄물",
    defaultScope: "잡지, 옥외광고",
    defaultDuration: "6개월", 
    defaultTerritory: "국내",
    allowedCustomizations: ["price", "duration", "territory", "quantity"]
  },
  full_commercial: {
    id: "full_commercial",
    name: "전체 상업용",
    defaultScope: "모든 채널",
    defaultDuration: "12개월",
    defaultTerritory: "전세계",
    allowedCustomizations: ["price", "duration", "territory", "scope", "exclusivity"]
  }
}
```

### 2. **Model's Custom Pricing** (Each Model Sets)

```javascript
// In modelProfiles collection
{
  modelId: "model_001",
  // ... other fields ...
  
  customPricing: {
    // Model can enable/disable license types
    online_basic: {
      enabled: true,
      basePrice: 300000,  // 채연 sets lower price as newcomer
      minDuration: "3개월",
      maxDuration: "12개월",
      availableTerritories: ["국내"],
      description: "SNS 및 웹사이트 광고에 적합",
      deliveryTime: "3일",
      revision: 2
    },
    online_premium: {
      enabled: true,
      basePrice: 800000,  // Her premium price
      minDuration: "6개월",
      maxDuration: "24개월",
      availableTerritories: ["국내", "아시아", "전세계"],
      description: "모든 온라인 채널 사용 가능",
      deliveryTime: "5일",
      revision: 3
    },
    broadcast: {
      enabled: false  // 채연 doesn't offer broadcast yet
    },
    print: {
      enabled: true,
      basePrice: 500000,
      // Custom quantity-based pricing
      quantityPricing: [
        { min: 1, max: 1000, priceMultiplier: 1 },
        { min: 1001, max: 10000, priceMultiplier: 1.5 },
        { min: 10001, max: null, priceMultiplier: 2 }
      ]
    },
    full_commercial: {
      enabled: true,
      basePrice: 2000000,  // Premium price for all rights
      exclusivityPricing: {
        nonExclusive: 1,  // Base price
        industryExclusive: 1.5,  // 1.5x for industry exclusivity  
        fullExclusive: 3  // 3x for full exclusivity
      }
    },
    
    // Model can create fully custom packages
    customPackages: [
      {
        id: "chaeyeon_special",
        name: "채연 스페셜 패키지",
        description: "신인 크리에이터를 위한 특별 할인",
        basePrice: 200000,
        scope: "YouTube, Instagram", 
        duration: "3개월",
        territory: "국내",
        conditions: "구독자 10만 이하 크리에이터 한정"
      }
    ]
  },
  
  // Pricing factors based on reputation
  pricingFactors: {
    experienceMultiplier: 1.0,  // 1.0 for newcomer, up to 2.0 for veterans
    demandMultiplier: 1.0,  // Dynamic based on booking frequency
    seasonalMultiplier: 1.0,  // Peak season pricing
    ratings: 4.5,
    completedProjects: 10
  }
}
```

### 3. **Smart Pricing Suggestions**

```javascript
// AI-powered pricing suggestions based on:
class PricingSuggestionEngine {
  suggestPricing(model) {
    const factors = {
      // Market analysis
      averageMarketPrice: this.getMarketAverage(model.categories),
      
      // Model factors  
      experience: model.profile.experience,
      portfolio: model.portfolio.quality,
      ratings: model.ratings.average,
      demand: model.stats.bookingFrequency,
      
      // Competition
      similarModels: this.findSimilarModels(model),
      pricePosition: 'competitive' // 'budget', 'competitive', 'premium'
    };
    
    return {
      suggested: {
        online_basic: this.calculatePrice('online_basic', factors),
        online_premium: this.calculatePrice('online_premium', factors),
        // ... other types
      },
      insights: {
        marketPosition: "Your prices are 15% below market average",
        recommendation: "Consider raising online_premium by ₩100,000",
        topPerformers: "Similar models charge ₩500,000-₩700,000"
      }
    };
  }
}
```

### 4. **Dynamic Pricing Rules**

Models can set dynamic pricing rules:

```javascript
dynamicPricingRules: {
  // Rush delivery
  rushDelivery: {
    enabled: true,
    '24hours': { multiplier: 2.0 },
    '48hours': { multiplier: 1.5 },
    '72hours': { multiplier: 1.2 }
  },
  
  // Bulk discounts
  bulkDiscount: {
    enabled: true,
    '3+': { discount: 0.1 },  // 10% off for 3+ licenses
    '5+': { discount: 0.15 },
    '10+': { discount: 0.2 }
  },
  
  // Long-term discounts
  durationDiscount: {
    enabled: true,
    '12months': { discount: 0.1 },
    '24months': { discount: 0.2 }
  },
  
  // Special conditions
  specialConditions: [
    {
      name: "스타트업 할인",
      condition: "startup",
      discount: 0.2,
      verification: "required"
    },
    {
      name: "비영리 단체",
      condition: "nonprofit", 
      discount: 0.3,
      verification: "required"
    }
  ]
}
```

### 5. **Customer-Facing License Builder**

When customers browse models, they see:

```javascript
// Dynamic price calculator on model profile
<LicenseBuilder>
  <SelectLicenseType />  // Shows only enabled types
  <CustomizeOptions>
    <DurationSlider />  // Within model's min/max
    <TerritorySelect /> // Model's available territories
    <ExclusivityToggle /> // If applicable
    <RushDeliveryOption />
  </CustomizeOptions>
  
  <PriceBreakdown>
    Base Price: ₩500,000
    Territory (Global): +₩200,000
    Rush Delivery (48h): +₩250,000
    Bulk Discount (3 licenses): -₩95,000
    ----------------
    Total: ₩855,000
  </PriceBreakdown>
  
  <ComparisonWidget>
    "This price is 12% below similar models"
  </ComparisonWidget>
</LicenseBuilder>
```

### 6. **Model Pricing Dashboard**

Models manage their pricing through:

```javascript
<ModelPricingDashboard>
  <PricingSuggestions />
  
  <LicenseTypeManager>
    {LICENSE_TYPES.map(type => (
      <LicenseTypeCard>
        <EnableToggle />
        <PriceInput />
        <OptionsCustomizer />
        <PreviewCalculator />
      </LicenseTypeCard>
    ))}
  </LicenseTypeManager>
  
  <CustomPackageBuilder>
    <CreateNewPackage />
  </CustomPackageBuilder>
  
  <PricingAnalytics>
    <ConversionRate />
    <AverageOrderValue />
    <PopularPackages />
    <PriceOptimizationTips />
  </PricingAnalytics>
  
  <CompetitorInsights>
    <MarketPricing />
    <YourPosition />
  </CompetitorInsights>
</ModelPricingDashboard>
```

### 7. **Database Structure Update**

```javascript
// Updated licensingPlans collection
{
  planId: "plan_model001_online_basic",
  modelId: "model_001",
  licenseType: "online_basic",  // References platform template
  
  // Model's customizations
  pricing: {
    basePrice: 300000,
    currency: "KRW",
    
    // Dynamic pricing rules
    modifiers: {
      rush: { '24h': 2.0, '48h': 1.5 },
      bulk: { '3+': 0.9, '5+': 0.85 },
      duration: { '12m': 0.9, '24m': 0.8 },
      territory: {
        'domestic': 1.0,
        'asia': 1.3,
        'global': 1.5
      }
    }
  },
  
  // Model's custom settings
  availability: {
    minDuration: "3개월",
    maxDuration: "12개월",
    territories: ["국내", "아시아"],
    deliveryTime: "3-5일",
    revisions: 2
  },
  
  // Custom description
  description: "채연의 밝고 친근한 이미지로 브랜드에 활력을!",
  
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 8. **Smart Recommendations**

```javascript
// For customers
"Based on your budget and needs, we recommend:"
- Model A: ₩300,000 (Best value)
- Model B: ₩450,000 (Top rated)
- Model C: ₩250,000 (Budget friendly)

// For models
"Your online_basic price is 20% below market. 
 Models with your experience typically charge ₩400,000-500,000"
```

## Benefits

1. **For Models:**
   - Complete control over their pricing
   - Ability to test different price points
   - Custom packages for niche markets
   - Dynamic pricing for demand management

2. **For Customers:**
   - Transparent, customizable pricing
   - Find models within budget
   - Clear understanding of what affects price
   - Bulk and long-term discounts

3. **For Platform:**
   - Competitive marketplace
   - Data-driven pricing insights
   - Higher satisfaction for both sides
   - Increased transaction volume