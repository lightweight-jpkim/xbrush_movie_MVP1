// ========================================
// Application Constants
// ========================================

// Model images configuration
const MODEL_IMAGES = {
    // Virtual model images (4 models)
    virtual1: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/7.png',
    virtual2: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/8.png', 
    virtual3: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/9.png',
    virtual4: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/10.png',
    
    // Actor images (6 actors)
    actor1: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/chae.png',  // 채연
    actor2: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/2.png',  // 아이유
    actor3: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/3.png',  // 이정재
    actor4: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/4.png',  // 전지현
    actor5: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/5.png',  // 박서준
    actor6: 'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/6.png'  // 손예진
};

// Step configuration
const STEPS = {
    TOTAL: 8,
    MODEL_SELECTION: 1,
    BASIC_INFO: 2,
    FORMAT_SELECTION: 3,
    STYLE_SELECTION: 4,
    SCENARIO_REVIEW: 5,
    VIDEO_CREATION: 6,
    RESULTS: 7,
    VIDEO_CUT_SELECTION: 8
};

// Progress status messages for video creation
const PROGRESS_STATUSES = [
    '시나리오 분석 중...',
    'AI 모델 준비 중...',
    '첫 번째 장면 생성 중...',
    '두 번째 장면 생성 중...',
    '세 번째 장면 생성 중...',
    '장면들 연결 중...',
    '오디오 추가 중...',
    '최종 편집 중...',
    '영상 완성!'
];

// Default scenario templates
const DEFAULT_SCENARIOS = {
    scene1: '매력적인 모델이 화면에 등장하며 밝은 미소를 지으며 제품을 소개합니다. "안녕하세요! 오늘 특별한 제품을 소개해드릴게요."',
    scene2: '제품의 핵심 기능과 장점을 강조하며 실제 사용 모습을 보여줍니다. "이 제품의 놀라운 효과를 직접 확인해보세요!"',
    scene3: '강력한 콜투액션과 함께 제품명을 다시 한번 강조합니다. "지금 바로 구매하고 특별한 혜택을 받아보세요!"'
};

// Video creation configuration
const VIDEO_CONFIG = {
    INITIAL_PROGRESS: 15,
    PROGRESS_INTERVAL: 800,
    MIN_PROGRESS_STEP: 8,
    MAX_PROGRESS_STEP: 20,
    COMPLETION_DELAY: 1000
};

// Toast notification configuration
const TOAST_CONFIG = {
    DURATION: 3000,
    POSITION: 'top-right'
};

// URL configuration
const URLS = {
    MODEL_REGISTRATION: 'model-register.html'
};

// Export constants for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MODEL_IMAGES,
        STEPS,
        PROGRESS_STATUSES,
        DEFAULT_SCENARIOS,
        VIDEO_CONFIG,
        TOAST_CONFIG,
        URLS
    };
}